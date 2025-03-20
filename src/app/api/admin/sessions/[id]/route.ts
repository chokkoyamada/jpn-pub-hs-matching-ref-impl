import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 選考セッション詳細取得API
 * GET /api/admin/sessions/[id]
 *
 * 特定の選考セッションの詳細情報を取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid session ID'
        },
        { status: 400 }
      );
    }

    // セッション情報を取得
    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session not found'
        },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // マッチング結果の概要を取得
    const summaryResult = await query(`
      SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN matched_school_id IS NOT NULL THEN 1 END) as matched_students,
        AVG(score) as average_score
      FROM exam_results
      WHERE session_id = ?
    `, [id]);

    // 学校ごとのマッチング数を取得
    const schoolsResult = await query(`
      SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
      FROM schools s
      LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `, [id]);

    // 試験結果とマッチング結果を取得
    const resultsResult = await query(`
      SELECT
        er.*,
        s.name as student_name,
        sch.name as school_name,
        sch.capacity as school_capacity
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      LEFT JOIN schools sch ON er.matched_school_id = sch.id
      WHERE er.session_id = ?
      ORDER BY er.score DESC
    `, [id]);

    return NextResponse.json({
      success: true,
      data: {
        session,
        summary: summaryResult.rows[0],
        schools: schoolsResult.rows,
        results: resultsResult.rows
      }
    });
  } catch (error) {
    console.error(`Error fetching session with ID ${params.id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch session details',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 選考セッション削除API
 * DELETE /api/admin/sessions/[id]
 *
 * 特定の選考セッションを削除する
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
          message: 'Invalid session ID'
        },
        { status: 400 }
      );
    }

    // セッションが存在するか確認
    const checkResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session not found'
        },
        { status: 404 }
      );
    }

    // 関連する試験結果を削除
    await query(
      `DELETE FROM exam_results WHERE session_id = ?`,
      [id]
    );

    // セッションを削除
    await query(
      `DELETE FROM selection_sessions WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting session with ID ${params.id}:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete session',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
