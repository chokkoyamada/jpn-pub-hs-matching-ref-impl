import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 選考セッション一覧取得API
 * GET /api/admin/sessions
 *
 * すべての選考セッション情報を取得する
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM selection_sessions
      ORDER BY created_at DESC
    `);

    // 各セッションの結果概要を取得
    const sessionsWithSummary = await Promise.all(
      result.rows.map(async (session: any) => {
        // マッチング結果の概要を取得
        const summaryResult = await query(`
          SELECT
            COUNT(DISTINCT er.student_id) as total_students,
            COUNT(DISTINCT CASE WHEN er.matched_school_id IS NOT NULL THEN er.student_id END) as matched_students,
            AVG(er.score) as average_score
          FROM exam_results er
          WHERE er.session_id = ?
        `, [session.id]);

        // 学校ごとのマッチング数を取得
        const schoolsResult = await query(`
          SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
          FROM schools s
          LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
          GROUP BY s.id
          ORDER BY s.id ASC
        `, [session.id]);

        return {
          ...session,
          summary: summaryResult.rows[0],
          schools: schoolsResult.rows
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: sessionsWithSummary
    });
  } catch (error) {
    console.error('Error fetching selection sessions:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch selection sessions',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 選考セッション作成API
 * POST /api/admin/sessions
 *
 * 新しい選考セッションを作成する
 */
export async function POST(request: NextRequest) {
  try {
    // 新しいセッションを作成
    const result = await query(`
      INSERT INTO selection_sessions (status)
      VALUES ('pending')
      RETURNING *
    `);

    const session = result.rows[0];

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Selection session created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating selection session:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create selection session',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
