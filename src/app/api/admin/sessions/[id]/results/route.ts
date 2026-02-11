import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';

/**
 * 選考セッションの結果取得API
 * GET /api/admin/sessions/[id]/results
 *
 * 特定の選考セッションの結果を取得する
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const sessionId = Number(id);

  try {

    if (isNaN(sessionId)) {
      return fail('Invalid session ID', 400);
    }

    // セッションが存在するか確認
    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return fail('Session not found', 404);
    }

    // 試験結果を取得
    const resultsResult = await query(
      `
      SELECT
        er.*,
        s.name as student_name,
        sc.name as school_name,
        a.preference_order as matched_preference_order
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      LEFT JOIN schools sc ON er.matched_school_id = sc.id
      LEFT JOIN applications a
        ON a.student_id = er.student_id
       AND a.school_id = er.matched_school_id
      WHERE er.session_id = ?
      ORDER BY er.score DESC
      `,
      [sessionId]
    );

    return ok(resultsResult.rows);
  } catch (error) {
    console.error(`[api/admin/sessions/${id}/results][GET] failed:`, error);
    return fail('Failed to fetch results', 500, error);
  }
}
