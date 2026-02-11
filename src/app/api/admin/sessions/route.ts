import { query } from '@/lib/db';
import { created, fail, ok } from '@/lib/api-response';
import { toSelectionSessionDto } from '@/lib/dto';

interface SessionRow {
  id: number | string;
  [key: string]: unknown;
}

/**
 * 選考セッション一覧取得API
 * GET /api/admin/sessions
 *
 * すべての選考セッション情報を取得する
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM selection_sessions
      ORDER BY created_at DESC
    `);

    // 各セッションの結果概要を取得
    const sessionsWithSummary = await Promise.all(
      result.rows.map(async (row) => {
        const session = row as unknown as SessionRow;
        const sessionId = Number(session.id);
        // マッチング結果の概要を取得
        const summaryResult = await query(`
          SELECT
            COUNT(DISTINCT er.student_id) as total_students,
            COUNT(DISTINCT CASE WHEN er.matched_school_id IS NOT NULL THEN er.student_id END) as matched_students,
            AVG(er.score) as average_score
          FROM exam_results er
          WHERE er.session_id = ?
        `, [sessionId]);

        // 学校ごとのマッチング数を取得
        const schoolsResult = await query(`
          SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
          FROM schools s
          LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
          GROUP BY s.id
          ORDER BY s.id ASC
        `, [sessionId]);

        return {
          ...toSelectionSessionDto(session),
          summary: summaryResult.rows[0],
          schools: schoolsResult.rows
        };
      })
    );

    return ok(sessionsWithSummary);
  } catch (error) {
    console.error('[api/admin/sessions][GET] failed:', error);
    return fail('Failed to fetch selection sessions', 500, error);
  }
}

/**
 * 選考セッション作成API
 * POST /api/admin/sessions
 *
 * 新しい選考セッションを作成する
 */
export async function POST() {
  try {
    // 新しいセッションを作成
    const result = await query(`
      INSERT INTO selection_sessions (status)
      VALUES ('pending')
      RETURNING *
    `);

    const session = toSelectionSessionDto(result.rows[0] as Record<string, unknown>);

    return created(session, 'Selection session created successfully');
  } catch (error) {
    console.error('[api/admin/sessions][POST] failed:', error);
    return fail('Failed to create selection session', 500, error);
  }
}
