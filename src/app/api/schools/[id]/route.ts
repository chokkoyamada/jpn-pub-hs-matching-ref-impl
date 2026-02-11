import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 高校詳細取得API
 * GET /api/schools/[id]
 *
 * 特定の高校の詳細情報を取得する
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
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

    // 高校情報を取得
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

    const school = schoolResult.rows[0];

    // 高校の応募者情報を取得
    const applicantsResult = await query(
      `
      SELECT a.*, s.name as student_name, s.contact_info as student_contact
      FROM applications a
      JOIN students s ON a.student_id = s.id
      WHERE a.school_id = ?
      ORDER BY a.preference_order ASC
      `,
      [schoolId]
    );

    // 高校のマッチング結果を取得
    const matchedStudentsResult = await query(
      `
      SELECT er.*, s.name as student_name, ss.created_at as session_date
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      JOIN selection_sessions ss ON er.session_id = ss.id
      WHERE er.matched_school_id = ?
      ORDER BY ss.created_at DESC, er.score DESC
      `,
      [schoolId]
    );

    return NextResponse.json({
      success: true,
      data: {
        school,
        applicants: applicantsResult.rows,
        matchedStudents: matchedStudentsResult.rows
      }
    });
  } catch (error) {
    console.error(`Error fetching school with ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch school details',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 高校情報更新API
 * PUT /api/schools/[id]
 *
 * 特定の高校の情報を更新する
 * リクエストボディ: { name?: string, location?: string, capacity?: number }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
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

    const body = await request.json();

    // 更新するフィールドがあるか確認
    if (!body.name && body.location === undefined && body.capacity === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'No fields to update'
        },
        { status: 400 }
      );
    }

    // 容量が正の数であることを確認
    if (body.capacity !== undefined && (typeof body.capacity !== 'number' || body.capacity <= 0)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Capacity must be a positive number'
        },
        { status: 400 }
      );
    }

    // 高校が存在するか確認
    const checkResult = await query(
      `SELECT * FROM schools WHERE id = ?`,
      [schoolId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'School not found'
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

    if (body.location !== undefined) {
      updateFields.push('location = ?');
      updateParams.push(body.location);
    }

    if (body.capacity !== undefined) {
      updateFields.push('capacity = ?');
      updateParams.push(body.capacity);
    }

    // IDをパラメータに追加
    updateParams.push(schoolId);

    // 高校情報を更新
    const result = await query(
      `
      UPDATE schools
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
      `,
      updateParams
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'School updated successfully'
    });
  } catch (error) {
    console.error(`Error updating school with ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update school',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 高校削除API
 * DELETE /api/schools/[id]
 *
 * 特定の高校を削除する
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
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
    const checkResult = await query(
      `SELECT * FROM schools WHERE id = ?`,
      [schoolId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'School not found'
        },
        { status: 404 }
      );
    }

    // 関連する応募情報を削除
    await query(
      `DELETE FROM applications WHERE school_id = ?`,
      [schoolId]
    );

    // 関連するマッチング結果を更新（マッチング先をnullに）
    await query(
      `
      UPDATE exam_results
      SET matched_school_id = NULL
      WHERE matched_school_id = ?
      `,
      [schoolId]
    );

    // 高校を削除
    await query(
      `DELETE FROM schools WHERE id = ?`,
      [schoolId]
    );

    return NextResponse.json({
      success: true,
      message: 'School deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting school with ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete school',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
