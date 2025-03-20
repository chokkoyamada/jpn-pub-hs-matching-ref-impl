import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 高校一覧取得API
 * GET /api/schools
 *
 * すべての高校情報を取得する
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM schools
      ORDER BY id ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching schools:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch schools',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          message: 'Name is required'
        },
        { status: 400 }
      );
    }

    if (body.capacity === undefined || typeof body.capacity !== 'number' || body.capacity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Capacity must be a positive number'
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'School created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create school',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
