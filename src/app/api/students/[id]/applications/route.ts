import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

/**
 * 学生の応募情報取得API
 * GET /api/students/[id]/applications
 *
 * 特定の学生の応募情報を取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student ID'
        },
        { status: 400 }
      );
    }

    // 学生が存在するか確認
    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found'
        },
        { status: 404 }
      );
    }

    // 学生の応募情報を取得
    const applicationsResult = await query(
      `
      SELECT a.*, s.name as school_name, s.location as school_location
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.preference_order ASC
      `,
      [studentId]
    );

    return NextResponse.json({
      success: true,
      data: applicationsResult.rows
    });
  } catch (error) {
    console.error(`Error fetching applications for student ID ${id}:`, error);

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

/**
 * 学生の応募情報登録API
 * POST /api/students/[id]/applications
 *
 * 特定の学生の応募情報を登録する
 * リクエストボディ: { applications: Array<{ school_id: number, preference_order: number }> }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // バリデーション
    if (!body.applications || !Array.isArray(body.applications) || body.applications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Applications array is required'
        },
        { status: 400 }
      );
    }

    if (body.applications.length > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 5 applications allowed'
        },
        { status: 400 }
      );
    }

    // 学生が存在するか確認
    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found'
        },
        { status: 404 }
      );
    }

    // 各応募の学校が存在するか確認
    const schoolIds = body.applications.map((app: any) => app.school_id);
    const schoolsResult = await query(
      `SELECT id FROM schools WHERE id IN (${schoolIds.map(() => '?').join(', ')})`,
      schoolIds
    );

    if (schoolsResult.rows.length !== new Set(schoolIds).size) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more schools not found'
        },
        { status: 400 }
      );
    }

    // 希望順位が重複していないか確認
    const preferenceOrders = body.applications.map((app: any) => app.preference_order);
    if (new Set(preferenceOrders).size !== preferenceOrders.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Duplicate preference orders are not allowed'
        },
        { status: 400 }
      );
    }

    // 既存の応募情報を削除
    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [studentId]
    );

    // 新しい応募情報を登録
    for (const app of body.applications) {
      await query(
        `
        INSERT INTO applications (student_id, school_id, preference_order)
        VALUES (?, ?, ?)
        `,
        [studentId, app.school_id, app.preference_order]
      );
    }

    // 登録後の応募情報を取得
    const updatedApplicationsResult = await query(
      `
      SELECT a.*, s.name as school_name, s.location as school_location
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.preference_order ASC
      `,
      [studentId]
    );

    return NextResponse.json({
      success: true,
      data: updatedApplicationsResult.rows,
      message: 'Applications submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error(`Error submitting applications for student ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit applications',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 学生の応募情報削除API
 * DELETE /api/students/[id]/applications
 *
 * 特定の学生の応募情報をすべて削除する
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student ID'
        },
        { status: 400 }
      );
    }

    // 学生が存在するか確認
    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found'
        },
        { status: 404 }
      );
    }

    // 応募情報を削除
    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [studentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Applications deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting applications for student ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete applications',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
