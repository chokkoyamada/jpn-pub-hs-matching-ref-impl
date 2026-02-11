import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';
import {
  generateRandomScores,
  MatchingAlgorithm,
  runMatching,
  School,
} from '@/lib/matching/da-algorithm';

interface ApplicationRow {
  student_id: number | string;
  school_id: number | string;
}

interface SchoolRow {
  id: number | string;
  capacity: number | string;
}

function toAlgorithm(value: string | null): MatchingAlgorithm {
  if (value === 'da') return 'da';
  return 'baseline';
}

async function loadModel(sessionId: number) {
  const applicationsResult = await query(
    `SELECT student_id, school_id, preference_order FROM applications ORDER BY student_id, preference_order`
  );

  const preferenceMap = new Map<number, number[]>();
  for (const row of applicationsResult.rows) {
    const app = row as unknown as ApplicationRow;
    const studentId = Number(app.student_id);
    const schoolId = Number(app.school_id);
    if (Number.isNaN(studentId) || Number.isNaN(schoolId)) continue;

    if (!preferenceMap.has(studentId)) {
      preferenceMap.set(studentId, []);
    }
    preferenceMap.get(studentId)!.push(schoolId);
  }

  const studentIds = [...preferenceMap.keys()];

  const existingScores = await query(`SELECT student_id, score FROM exam_results WHERE session_id = ?`, [sessionId]);
  const scoreMap = new Map<number, number>();

  existingScores.rows.forEach((row) => {
    const studentId = Number((row as Record<string, unknown>).student_id);
    const score = Number((row as Record<string, unknown>).score);
    if (!Number.isNaN(studentId) && !Number.isNaN(score)) {
      scoreMap.set(studentId, score);
    }
  });

  if (scoreMap.size === 0) {
    const generated = generateRandomScores(studentIds, 0, 100, sessionId);
    generated.forEach((score, studentId) => scoreMap.set(studentId, score));
  }

  const schoolsResult = await query(`SELECT id, capacity FROM schools`);
  const schools = schoolsResult.rows
    .map((row) => {
      const school = row as unknown as SchoolRow;
      const id = Number(school.id);
      const capacity = Number(school.capacity);
      if (Number.isNaN(id) || Number.isNaN(capacity)) return null;
      return { id, capacity };
    })
    .filter((school): school is School => school !== null);

  const students = studentIds.map((studentId) => ({
    id: studentId,
    score: scoreMap.get(studentId) ?? 0,
    preferences: preferenceMap.get(studentId) ?? [],
  }));

  return { students, schools };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sessionId = Number(id);

  try {
    if (Number.isNaN(sessionId)) {
      return fail('Invalid session ID', 400);
    }

    const sessionResult = await query(`SELECT * FROM selection_sessions WHERE id = ?`, [sessionId]);
    if (sessionResult.rows.length === 0) {
      return fail('Session not found', 404);
    }

    const { students, schools } = await loadModel(sessionId);
    if (students.length === 0) {
      return fail('No applications found', 400);
    }

    const algorithm = toAlgorithm(request.nextUrl.searchParams.get('algorithm'));
    const outcome = runMatching(algorithm, students, schools);

    return ok({
      algorithm,
      trace: outcome.trace,
      summary: outcome.summary,
    });
  } catch (error) {
    console.error(`[api/admin/sessions/${id}/trace][GET] failed:`, error);
    return fail('Failed to fetch trace', 500, error);
  }
}
