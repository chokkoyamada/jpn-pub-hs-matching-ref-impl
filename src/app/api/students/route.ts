import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { ok, created, fail } from '@/lib/api-response';
import { toStudentDto } from '@/lib/dto';

/**
 * 学生一覧取得API
 * GET /api/students
 *
 * すべての学生情報を取得する
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM students
      ORDER BY id ASC
    `);

    return ok(result.rows.map((row) => toStudentDto(row as Record<string, unknown>)));
  } catch (error) {
    console.error('[api/students][GET] failed:', error);
    return fail('Failed to fetch students', 500, error);
  }
}

/**
 * 学生登録API
 * POST /api/students
 *
 * 新しい学生を登録する
 * リクエストボディ: { name: string, contact_info?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    if (!body.name) {
      return fail('Name is required', 400);
    }

    // 次のIDを取得
    const maxIdResult = await query(`
      SELECT MAX(id) as max_id FROM students
    `);

    // 数値に変換して処理
    const maxId = Number(maxIdResult.rows[0]?.max_id || 0);
    const newId = maxId + 1;

    // 学生を登録
    const result = await query(
      `
      INSERT INTO students (id, name, contact_info)
      VALUES (?, ?, ?)
      RETURNING *
      `,
      [newId, body.name, body.contact_info || null]
    );

    return created(toStudentDto(result.rows[0] as Record<string, unknown>), 'Student created successfully');
  } catch (error) {
    console.error('[api/students][POST] failed:', error);
    return fail('Failed to create student', 500, error);
  }
}
