import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching applications:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch applications',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
