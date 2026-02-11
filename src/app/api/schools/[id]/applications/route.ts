import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';

/**
 * 高校の応募情報取得API
 * GET /api/schools/[id]/applications
 *
 * 特定の高校への応募情報を取得する
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const schoolId = Number(id);

  try {

    if (isNaN(schoolId)) {
      return fail('Invalid school ID', 400);
    }

    // 高校が存在するか確認
    const schoolResult = await query(
      `SELECT * FROM schools WHERE id = ?`,
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return fail('School not found', 404);
    }

    // 応募情報を取得
    const applicationsResult = await query(
      `SELECT a.*, s.name as student_name
       FROM applications a
       JOIN students s ON a.student_id = s.id
       WHERE a.school_id = ?
       ORDER BY a.preference_order ASC`,
      [schoolId]
    );

    return ok(applicationsResult.rows);
  } catch (error) {
    console.error(`[api/schools/${id}/applications][GET] failed:`, error);
    return fail('Failed to fetch applications', 500, error);
  }
}
