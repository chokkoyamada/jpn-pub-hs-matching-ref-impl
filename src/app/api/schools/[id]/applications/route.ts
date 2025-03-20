import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 高校の応募情報取得API
 * GET /api/schools/[id]/applications
 *
 * 特定の高校への応募情報を取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const schoolId = Number(id);

    if (isNaN(schoolId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid school ID'
        },
        { status: 400 }
      );
    }

    // 高校が存在するか確認
    const schoolResult = await query(
      `SELECT * FROM schools WHERE id = ?`,
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'School not found'
        },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      data: applicationsResult.rows
    });
  } catch (error) {
    console.error(`Error fetching applications for school ID ${id}:`, error);

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
