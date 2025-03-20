import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 学生の試験結果取得API
 * GET /api/students/[id]/results
 *
 * 特定の学生の試験結果を取得する
 * クエリパラメータ: session_id - 選考セッションID（指定しない場合は全てのセッションの結果を取得）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

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

    // 試験結果を取得
    let resultsQuery = `
      SELECT er.*, s.name as school_name
      FROM exam_results er
      LEFT JOIN schools s ON er.matched_school_id = s.id
      WHERE er.student_id = ?
    `;
    const queryParams = [studentId];

    // セッションIDが指定されている場合は、そのセッションの結果のみを取得
    if (sessionId) {
      resultsQuery += ` AND er.session_id = ?`;
      queryParams.push(Number(sessionId));
    }

    resultsQuery += ` ORDER BY er.session_id DESC`;

    const resultsResult = await query(resultsQuery, queryParams);

    return NextResponse.json({
      success: true,
      data: resultsResult.rows
    });
  } catch (error) {
    console.error(`Error fetching results for student ID ${id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch results',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
