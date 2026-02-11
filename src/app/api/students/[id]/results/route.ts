import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';

/**
 * 学生の試験結果取得API
 * GET /api/students/[id]/results
 *
 * 特定の学生の試験結果を取得する
 * クエリパラメータ: session_id - 選考セッションID（指定しない場合は全てのセッションの結果を取得）
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const studentId = Number(id);
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  try {

    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    // 学生が存在するか確認
    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

    // 試験結果を取得
    let resultsQuery = `
      SELECT
        er.*,
        s.name as school_name,
        a.preference_order as matched_preference_order
      FROM exam_results er
      LEFT JOIN schools s ON er.matched_school_id = s.id
      LEFT JOIN applications a
        ON a.student_id = er.student_id
       AND a.school_id = er.matched_school_id
      WHERE er.student_id = ?
    `;
    const queryParams = [studentId];

    // セッションIDが指定されている場合は、そのセッションの結果のみを取得
    if (sessionId) {
      resultsQuery += ` AND er.session_id = ?`;
      queryParams.push(Number(sessionId));
    }

    resultsQuery += ` ORDER BY er.session_id DESC`;

    const resultsResult = await query(resultsQuery, queryParams);

    return ok(resultsResult.rows);
  } catch (error) {
    console.error(`[api/students/${id}/results][GET] failed:`, error);
    return fail('Failed to fetch results', 500, error);
  }
}
