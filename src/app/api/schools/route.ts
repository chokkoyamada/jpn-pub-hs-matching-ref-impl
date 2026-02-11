import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { ok, created, fail } from '@/lib/api-response';
import { toSchoolDto } from '@/lib/dto';

/**
 * 高校一覧取得API
 * GET /api/schools
 *
 * すべての高校情報を取得する
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM schools
      ORDER BY id ASC
    `);

    return ok(result.rows.map((row) => toSchoolDto(row as Record<string, unknown>)));
  } catch (error) {
    console.error('[api/schools][GET] failed:', error);
    return fail('Failed to fetch schools', 500, error);
  }
}

/**
 * 高校登録API
 * POST /api/schools
 *
 * 新しい高校を登録する
 * リクエストボディ: { name: string, location?: string, capacity: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    if (!body.name) {
      return fail('Name is required', 400);
    }

    if (body.capacity === undefined || typeof body.capacity !== 'number' || body.capacity <= 0) {
      return fail('Capacity must be a positive number', 400);
    }

    // 次のIDを取得
    const maxIdResult = await query(`
      SELECT MAX(id) as max_id FROM schools
    `);

    // 数値に変換して処理
    const maxId = Number(maxIdResult.rows[0]?.max_id || 0);
    const newId = maxId + 1;

    // 高校を登録
    const result = await query(
      `
      INSERT INTO schools (id, name, location, capacity)
      VALUES (?, ?, ?, ?)
      RETURNING *
      `,
      [newId, body.name, body.location || null, body.capacity]
    );

    return created(toSchoolDto(result.rows[0] as Record<string, unknown>), 'School created successfully');
  } catch (error) {
    console.error('[api/schools][POST] failed:', error);
    return fail('Failed to create school', 500, error);
  }
}
