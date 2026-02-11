import type { MatchResult, MatchingOutcome, MatchingTraceStep, School, Student } from '@/lib/matching/types';

export function runBaselineMatching(
  students: Student[],
  schools: School[],
  proposalReason: string = '希望順位に沿って応募'
): MatchingOutcome {
  const sortedStudents = [...students].sort((a, b) => b.score - a.score || a.id - b.id);
  const schoolCapacity = new Map<number, number>();

  schools.forEach((school) => {
    schoolCapacity.set(school.id, school.capacity);
  });

  const results: MatchResult[] = [];
  const trace: MatchingTraceStep[] = [];

  for (const student of sortedStudents) {
    let matchedSchoolId: number | null = null;

    for (const schoolId of student.preferences) {
      trace.push({
        round: 1,
        studentId: student.id,
        schoolId,
        action: 'propose',
        reason: proposalReason,
      });

      const remainingCapacity = schoolCapacity.get(schoolId) ?? 0;
      if (remainingCapacity > 0) {
        schoolCapacity.set(schoolId, remainingCapacity - 1);
        matchedSchoolId = schoolId;
        trace.push({
          round: 1,
          studentId: student.id,
          schoolId,
          action: 'finalize',
          reason: '空き定員あり',
        });
        break;
      }

      trace.push({
        round: 1,
        studentId: student.id,
        schoolId,
        action: 'reject',
        reason: '定員超過',
      });
    }

    results.push({ studentId: student.id, schoolId: matchedSchoolId });
  }

  return {
    results,
    summary: summarizeResults(results, students),
    trace,
  };
}

export function summarizeResults(results: MatchResult[], students: Student[]) {
  const totalStudents = results.length;
  const matchedStudents = results.filter((r) => r.schoolId !== null).length;
  const unmatchedCount = totalStudents - matchedStudents;
  const matchRate = totalStudents > 0 ? (matchedStudents / totalStudents) * 100 : 0;

  const maxPreferenceSize = Math.max(...students.map((student) => student.preferences.length), 5);
  const preferenceStats = Array.from({ length: maxPreferenceSize }, () => 0);

  results.forEach((result) => {
    if (result.schoolId === null) return;

    const student = students.find((s) => s.id === result.studentId);
    if (!student) return;

    const preferenceIndex = student.preferences.indexOf(result.schoolId);
    if (preferenceIndex >= 0) {
      preferenceStats[preferenceIndex] += 1;
    }
  });

  const preferenceRates = preferenceStats.map((count) => (totalStudents > 0 ? (count / totalStudents) * 100 : 0));

  return {
    totalStudents,
    matchedStudents,
    unmatchedCount,
    matchRate,
    preferenceStats,
    preferenceRates,
    firstChoiceRate: preferenceRates[0] ?? 0,
  };
}
