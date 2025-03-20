import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 学生一覧取得API
 * GET /api/students
 *
 * すべての学生情報を取得する
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM students
      ORDER BY id ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching students:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch students',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          message: 'Name is required'
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Student created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create student',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
