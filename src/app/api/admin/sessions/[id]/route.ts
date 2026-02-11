import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';
import { toSelectionSessionDto } from '@/lib/dto';

/**
 * 選考セッション情報取得API
 * GET /api/admin/sessions/[id]
 *
 * 特定の選考セッションの詳細情報を取得する
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const sessionId = Number(id);

    if (isNaN(sessionId)) {
      return fail('Invalid session ID', 400);
    }

    // セッション情報を取得
    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return fail('Session not found', 404);
    }

    const session = toSelectionSessionDto(sessionResult.rows[0] as Record<string, unknown>);

    // マッチング結果の概要を取得
    const summaryResult = await query(`
      SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN matched_school_id IS NOT NULL THEN 1 END) as matched_students,
        AVG(score) as average_score
      FROM exam_results
      WHERE session_id = ?
    `, [sessionId]);

    // 学校ごとのマッチング数を取得
    const schoolsResult = await query(`
      SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
      FROM schools s
      LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `, [sessionId]);

    return ok({
      session: {
        ...session,
        summary: summaryResult.rows[0],
        schools: schoolsResult.rows
      }
    });
  } catch (error) {
    console.error(`[api/admin/sessions/${id}][GET] failed:`, error);
    return fail('Failed to fetch session details', 500, error);
  }
}
