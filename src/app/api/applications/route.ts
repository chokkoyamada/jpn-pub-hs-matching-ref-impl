import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';

/**
 * 応募情報一覧取得API
 * GET /api/applications
 *
 * すべての応募情報を取得する
 */
export async function GET() {
  try {
    // すべての応募情報を取得
    const result = await query(`
      SELECT a.*, s.name as student_name, sc.name as school_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN schools sc ON a.school_id = sc.id
      ORDER BY a.student_id, a.preference_order ASC
    `);

    return ok(result.rows);
  } catch (error) {
    console.error('[api/applications][GET] failed:', error);
    return fail('Failed to fetch applications', 500, error);
  }
}
