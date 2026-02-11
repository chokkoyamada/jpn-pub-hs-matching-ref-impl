import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { created, fail, ok } from '@/lib/api-response';

/**
 * 学生の応募情報取得API
 * GET /api/students/[id]/applications
 */
type Params = { id: string };
type ApplicationPayload = { school_id: number; preference_order: number };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const studentId = Number(id);

  try {
    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

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

    return ok(applicationsResult.rows);
  } catch (error) {
    console.error(`[api/students/${id}/applications][GET] failed:`, error);
    return fail('Failed to fetch applications', 500, error);
  }
}

/**
 * 学生の応募情報登録API
 * POST /api/students/[id]/applications
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const studentId = Number(id);

  try {
    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    const body = await request.json();
    const applications = body.applications as ApplicationPayload[] | undefined;

    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return fail('Applications array is required', 400);
    }

    if (applications.length > 5) {
      return fail('Maximum 5 applications allowed', 400);
    }

    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );
    if (studentResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

    const schoolIds = applications.map((app) => app.school_id);
    const schoolsResult = await query(
      `SELECT id FROM schools WHERE id IN (${schoolIds.map(() => '?').join(', ')})`,
      schoolIds
    );
    if (schoolsResult.rows.length !== new Set(schoolIds).size) {
      return fail('One or more schools not found', 400);
    }

    const preferenceOrders = applications.map((app) => app.preference_order);
    if (new Set(preferenceOrders).size !== preferenceOrders.length) {
      return fail('Duplicate preference orders are not allowed', 400);
    }

    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [studentId]
    );

    for (const app of applications) {
      await query(
        `
        INSERT INTO applications (student_id, school_id, preference_order)
        VALUES (?, ?, ?)
        `,
        [studentId, app.school_id, app.preference_order]
      );
    }

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

    return created(updatedApplicationsResult.rows, 'Applications submitted successfully');
  } catch (error) {
    console.error(`[api/students/${id}/applications][POST] failed:`, error);
    return fail('Failed to submit applications', 500, error);
  }
}

/**
 * 学生の応募情報削除API
 * DELETE /api/students/[id]/applications
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  const studentId = Number(id);

  try {
    if (isNaN(studentId)) {
      return fail('Invalid student ID', 400);
    }

    const studentResult = await query(
      `SELECT * FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return fail('Student not found', 404);
    }

    await query(
      `DELETE FROM applications WHERE student_id = ?`,
      [studentId]
    );

    return ok({ deleted: true });
  } catch (error) {
    console.error(`[api/students/${id}/applications][DELETE] failed:`, error);
    return fail('Failed to delete applications', 500, error);
  }
}
