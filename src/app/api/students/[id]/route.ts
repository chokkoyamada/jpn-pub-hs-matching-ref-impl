import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 学生詳細取得API
 * GET /api/students/[id]
 *
 * 特定の学生の詳細情報を取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // 学生情報を取得
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

    const student = studentResult.rows[0];

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

    // 学生の試験結果を取得
    const resultsResult = await query(
      `
      SELECT er.*, ss.created_at as session_date, s.name as school_name
      FROM exam_results er
      JOIN selection_sessions ss ON er.session_id = ss.id
      LEFT JOIN schools s ON er.matched_school_id = s.id
      WHERE er.student_id = ?
      ORDER BY ss.created_at DESC
      `,
      [studentId]
    );

    return NextResponse.json({
      success: true,
      data: {
        student,
        applications: applicationsResult.rows,
        results: resultsResult.rows
      }
    });
  } catch (error) {
    console.error(`Error fetching student with ID ${params.id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch student details',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 学生情報更新API
 * PUT /api/students/[id]
 *
 * 特定の学生の情報を更新する
 * リクエストボディ: { name?: string, contact_info?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 更新するフィールドがあるか確認
    if (!body.name && body.contact_info === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'No fields to update'
        },
        { status: 400 }
      );
    }

    // 学生が存在するか確認
    const checkResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found'
        },
        { status: 404 }
      );
    }

    // 更新するフィールドとパラメータを構築
    const updateFields = [];
    const updateParams = [];

    if (body.name) {
      updateFields.push('name = ?');
      updateParams.push(body.name);
    }

    if (body.contact_info !== undefined) {
      updateFields.push('contact_info = ?');
      updateParams.push(body.contact_info);
    }

    // IDをパラメータに追加
    updateParams.push(id);

    // 学生情報を更新
    const result = await query(
      `
      UPDATE students
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
      `,
      updateParams
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error(`Error updating student with ID ${params.id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update student',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 学生削除API
 * DELETE /api/students/[id]
 *
 * 特定の学生を削除する
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student ID'
        },
        { status: 400 }
      );
    }

    // 学生が存在するか確認
    const checkResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found'
        },
        { status: 404 }
      );
    }

    // 関連する応募情報を削除
    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [id]
    );

    // 関連する試験結果を削除
    await query(
      `DELETE FROM exam_results WHERE student_id = ?`,
      [id]
    );

    // 学生を削除
    await query(
      `DELETE FROM students WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting student with ID ${params.id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete student',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
