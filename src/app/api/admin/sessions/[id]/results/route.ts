import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 選考セッションの結果取得API
 * GET /api/admin/sessions/[id]/results
 *
 * 特定の選考セッションの結果を取得する
 */
type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  const { id } = context.params;
  const sessionId = Number(id);

  try {

    if (isNaN(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid session ID'
        },
        { status: 400 }
      );
    }

    // セッションが存在するか確認
    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [sessionId]
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

    // 試験結果を取得
    const resultsResult = await query(
      `
      SELECT er.*, s.name as student_name, sc.name as school_name
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      LEFT JOIN schools sc ON er.matched_school_id = sc.id
      WHERE er.session_id = ?
      ORDER BY er.score DESC
      `,
      [sessionId]
    );

    return NextResponse.json({
      success: true,
      data: resultsResult.rows
    });
  } catch (error) {
    console.error(`Error fetching results for session ID ${context.params.id}:`, error);

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
