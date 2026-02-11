import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  runMatching,
  generateRandomScores,
  Student,
  School,
  MatchingAlgorithm,
  MatchingOutcome,
} from '@/lib/matching/da-algorithm';
import { fail, ok } from '@/lib/api-response';
import { toSelectionSessionDto } from '@/lib/dto';

interface SchoolRow {
  id: number | string;
  capacity: number | string;
}

interface ApplicationRow {
  student_id: number | string;
  school_id: number | string;
}

function isValidAlgorithm(value: unknown): value is MatchingAlgorithm {
  return value === 'baseline' || value === 'da';
}

async function loadStudentsAndSchools(sessionId: number) {
  const applicationsResult = await query(`
    SELECT a.student_id, a.school_id, a.preference_order
    FROM applications a
    ORDER BY a.student_id, a.preference_order
  `);

  if (applicationsResult.rows.length === 0) {
    return { students: [], schools: [] };
  }

  const studentPreferences = new Map<number, number[]>();
  for (const app of applicationsResult.rows) {
    const row = app as unknown as ApplicationRow;
    const studentId = Number(row.student_id);
    const schoolId = Number(row.school_id);

    if (Number.isNaN(studentId) || Number.isNaN(schoolId)) continue;

    if (!studentPreferences.has(studentId)) {
      studentPreferences.set(studentId, []);
    }
    studentPreferences.get(studentId)!.push(schoolId);
  }

  const studentIds = Array.from(studentPreferences.keys());

  const existingScoresResult = await query(
    `SELECT student_id, score FROM exam_results WHERE session_id = ?`,
    [sessionId]
  );

  const scores = new Map<number, number>();
  existingScoresResult.rows.forEach((row) => {
    const studentId = Number((row as Record<string, unknown>).student_id);
    const score = Number((row as Record<string, unknown>).score);
    if (!Number.isNaN(studentId) && !Number.isNaN(score)) {
      scores.set(studentId, score);
    }
  });

  if (scores.size === 0) {
    const generated = generateRandomScores(studentIds, 0, 100, sessionId);
    generated.forEach((score, studentId) => scores.set(studentId, score));
  }

  const schoolsResult = await query(`SELECT id, capacity FROM schools`);

  const students: Student[] = studentIds.map((id) => ({
    id,
    score: scores.get(id) ?? 0,
    preferences: studentPreferences.get(id) ?? [],
  }));

  const schools: School[] = schoolsResult.rows
    .map((row) => {
      const school = row as unknown as SchoolRow;
      const id = Number(school.id);
      const capacity = Number(school.capacity);
      if (Number.isNaN(id) || Number.isNaN(capacity)) {
        return null;
      }
      return { id, capacity };
    })
    .filter((school): school is School => school !== null);

  return { students, schools };
}

function getMatchedPreferenceOrder(student: Student, schoolId: number | null): number | null {
  if (schoolId === null) return null;
  const index = student.preferences.indexOf(schoolId);
  if (index < 0) return null;
  return index + 1;
}

function summaryByPreference(outcome: MatchingOutcome) {
  return outcome.summary.preferenceStats.map((count, index) => ({
    preferenceOrder: index + 1,
    matchedCount: count,
    matchedRate: outcome.summary.preferenceRates[index] ?? 0,
  }));
}

/**
 * マッチング実行API
 * POST /api/admin/sessions/[id]/run
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const sessionId = Number(id);

    if (Number.isNaN(sessionId)) {
      return fail('Invalid session ID', 400);
    }

    const body = await request.json().catch(() => ({}));
    const requestedAlgorithm = (body as { algorithm?: unknown }).algorithm;
    const algorithm: MatchingAlgorithm = isValidAlgorithm(requestedAlgorithm)
      ? requestedAlgorithm
      : 'baseline';

    if (!isValidAlgorithm(algorithm)) {
      return fail('Invalid algorithm', 400);
    }

    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return fail('Session not found', 404);
    }

    const sessionRow = sessionResult.rows[0] as Record<string, unknown>;
    const session = toSelectionSessionDto(sessionRow);
    if (session.status === 'completed') {
      return fail('Session already completed', 400);
    }

    const { students, schools } = await loadStudentsAndSchools(sessionId);
    if (students.length === 0) {
      return fail('No applications found', 400);
    }

    const outcome = runMatching(algorithm, students, schools);

    await query(`DELETE FROM exam_results WHERE session_id = ?`, [sessionId]);

    await query(
      `INSERT INTO matching_runs (session_id, algorithm, summary_json) VALUES (?, ?, ?)`,
      [sessionId, algorithm, JSON.stringify(outcome.summary)]
    );
    const runIdResult = await query(`SELECT last_insert_rowid() as id`);
    const runId = Number((runIdResult.rows[0] as Record<string, unknown>).id);

    for (let i = 0; i < outcome.trace.length; i += 1) {
      await query(
        `INSERT INTO matching_trace_steps (run_id, step_index, payload_json) VALUES (?, ?, ?)`,
        [runId, i, JSON.stringify(outcome.trace[i])]
      );
    }

    for (const student of students) {
      const matchResult = outcome.results.find((r) => r.studentId === student.id);
      if (!matchResult) continue;

      await query(
        `
        INSERT INTO exam_results (
          session_id,
          student_id,
          score,
          algorithm,
          matched_school_id
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          sessionId,
          student.id,
          student.score,
          algorithm,
          matchResult.schoolId,
        ]
      );
    }

    await query(
      `UPDATE selection_sessions SET status = 'completed' WHERE id = ?`,
      [sessionId]
    );

    const summaryResult = await query(
      `
      SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN matched_school_id IS NOT NULL THEN 1 END) as matched_students,
        AVG(score) as average_score
      FROM exam_results
      WHERE session_id = ?
      `,
      [sessionId]
    );

    const schoolsMatchResult = await query(
      `
      SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
      FROM schools s
      LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
      `,
      [sessionId]
    );

    const preferenceSummary = summaryByPreference(outcome);

    return ok({
      algorithm,
      session: {
        ...session,
        status: 'completed',
      },
      summary: summaryResult.rows[0],
      schools: schoolsMatchResult.rows,
      summaryByPreference: preferenceSummary,
      unmatchedCount: outcome.summary.unmatchedCount,
      firstChoiceRate: outcome.summary.firstChoiceRate,
      totalMatches: outcome.results.filter((r) => r.schoolId !== null).length,
      totalStudents: students.length,
      results: outcome.results.map((result) => {
        const student = students.find((s) => s.id === result.studentId);
        return {
          ...result,
          matchedPreferenceOrder: student ? getMatchedPreferenceOrder(student, result.schoolId) : null,
        };
      }),
    });
  } catch (error) {
    console.error(`[api/admin/sessions/${id}/run][POST] failed:`, error);
    return fail('Failed to run matching', 500, error);
  }
}
