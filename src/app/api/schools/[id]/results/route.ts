import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';

/**
 * 高校の試験結果取得API
 * GET /api/schools/[id]/results
 *
 * 特定の高校の試験結果を取得する
 * クエリパラメータ: session_id - 選考セッションID（指定しない場合は全てのセッションの結果を取得）
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const schoolId = Number(id);
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

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

    // 試験結果を取得
    let resultsQuery = `
      SELECT er.*, s.name as student_name
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      WHERE er.matched_school_id = ? OR er.student_id IN (
        SELECT student_id FROM applications WHERE school_id = ?
      )
    `;
    const queryParams = [schoolId, schoolId];

    // セッションIDが指定されている場合は、そのセッションの結果のみを取得
    if (sessionId) {
      resultsQuery += ` AND er.session_id = ?`;
      queryParams.push(Number(sessionId));
    }

    resultsQuery += ` ORDER BY er.score DESC`;

    const resultsResult = await query(resultsQuery, queryParams);

    return ok(resultsResult.rows);
  } catch (error) {
    console.error(`[api/schools/${id}/results][GET] failed:`, error);
    return fail('Failed to fetch results', 500, error);
  }
}
