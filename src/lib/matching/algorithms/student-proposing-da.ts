import type { MatchResult, MatchingOutcome, MatchingTraceStep, School, Student } from '@/lib/matching/types';
import { summarizeResults } from '@/lib/matching/algorithms/baseline';

function rankBySchool(students: Student[]): Map<number, number> {
  const sorted = [...students].sort((a, b) => b.score - a.score || a.id - b.id);
  return new Map(sorted.map((student, index) => [student.id, index]));
}

export function runStudentProposingDA(students: Student[], schools: School[]): MatchingOutcome {
  const schoolMap = new Map<number, School>(schools.map((school) => [school.id, school]));
  const priorityRank = rankBySchool(students);

  const nextChoiceIndex = new Map<number, number>();
  const matchedSchoolByStudent = new Map<number, number | null>();
  const holdsBySchool = new Map<number, number[]>();
  const trace: MatchingTraceStep[] = [];

  students.forEach((student) => {
    nextChoiceIndex.set(student.id, 0);
    matchedSchoolByStudent.set(student.id, null);
  });
  schools.forEach((school) => holdsBySchool.set(school.id, []));

  let round = 1;
  let progressed = true;

  while (progressed) {
    progressed = false;

    for (const student of students) {
      if (matchedSchoolByStudent.get(student.id) !== null) {
        continue;
      }

      const index = nextChoiceIndex.get(student.id) ?? 0;
      if (index >= student.preferences.length) {
        continue;
      }

      progressed = true;
      const schoolId = student.preferences[index];
      nextChoiceIndex.set(student.id, index + 1);

      trace.push({
        round,
        studentId: student.id,
        schoolId,
        action: 'propose',
        reason: `${index + 1}志望に応募`,
      });

      const school = schoolMap.get(schoolId);
      if (!school) {
        trace.push({
          round,
          studentId: student.id,
          schoolId,
          action: 'reject',
          reason: '学校データなし',
        });
        continue;
      }

      const currentHeld = [...(holdsBySchool.get(schoolId) ?? [])];
      const candidates = [...currentHeld, student.id].sort((a, b) => {
        return (priorityRank.get(a) ?? Number.MAX_SAFE_INTEGER) - (priorityRank.get(b) ?? Number.MAX_SAFE_INTEGER);
      });

      const kept = candidates.slice(0, school.capacity);
      const rejected = candidates.slice(school.capacity);

      holdsBySchool.set(schoolId, kept);

      kept.forEach((studentId) => {
        matchedSchoolByStudent.set(studentId, schoolId);
        trace.push({
          round,
          studentId,
          schoolId,
          action: 'hold',
          reason: '定員内で保留',
        });
      });

      rejected.forEach((studentId) => {
        matchedSchoolByStudent.set(studentId, null);
        trace.push({
          round,
          studentId,
          schoolId,
          action: 'reject',
          reason: '優先順位で押し出し',
        });
      });
    }

    round += 1;
  }

  const results: MatchResult[] = students.map((student) => ({
    studentId: student.id,
    schoolId: matchedSchoolByStudent.get(student.id) ?? null,
  }));

  results.forEach((result) => {
    if (result.schoolId === null) return;
    trace.push({
      round,
      studentId: result.studentId,
      schoolId: result.schoolId,
      action: 'finalize',
      reason: '最終確定',
    });
  });

  return {
    results,
    summary: summarizeResults(results, students),
    trace,
  };
}
