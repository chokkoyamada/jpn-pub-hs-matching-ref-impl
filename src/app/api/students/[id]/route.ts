import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/api-response';
import { toStudentDto } from '@/lib/dto';

/**
 * 学生詳細取得API
 * GET /api/students/[id]
 *
 * 特定の学生の詳細情報を取得する
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    // 学生情報を取得
    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

    const student = toStudentDto(studentResult.rows[0] as Record<string, unknown>);

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

    return ok({
      student,
      applications: applicationsResult.rows,
      results: resultsResult.rows
    });
  } catch (error) {
    console.error(`[api/students/${id}][GET] failed:`, error);
    return fail('Failed to fetch student details', 500, error);
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
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    const body = await request.json();

    // 更新するフィールドがあるか確認
    if (!body.name && body.contact_info === undefined) {
      return fail('No fields to update', 400);
    }

    // 学生が存在するか確認
    const checkResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (checkResult.rows.length === 0) {
      return fail('Student not found', 404);
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
    updateParams.push(studentId);

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

    return ok(toStudentDto(result.rows[0] as Record<string, unknown>));
  } catch (error) {
    console.error(`[api/students/${id}][PUT] failed:`, error);
    return fail('Failed to update student', 500, error);
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
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    // 学生が存在するか確認
    const checkResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (checkResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

    // 関連する応募情報を削除
    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [studentId]
    );

    // 関連する試験結果を削除
    await query(
      `DELETE FROM exam_results WHERE student_id = ?`,
      [studentId]
    );

    // 学生を削除
    await query(
      `DELETE FROM students WHERE id = ?`,
      [studentId]
    );

    return ok({ deleted: true });
  } catch (error) {
    console.error(`[api/students/${id}][DELETE] failed:`, error);
    return fail('Failed to delete student', 500, error);
  }
}
