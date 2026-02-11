import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { runDAAlgorithm, generateRandomScores, Student, School } from '@/lib/matching/da-algorithm';
import { fail, ok } from '@/lib/api-response';
import { toSelectionSessionDto } from '@/lib/dto';

interface SchoolRow {
  id: number | string;
  capacity: number | string;
}

/**
 * マッチング実行API
 * POST /api/admin/sessions/[id]/run
 *
 * 特定の選考セッションに対してマッチングを実行する
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const sessionId = Number(id);

    if (isNaN(sessionId)) {
      return fail('Invalid session ID', 400);
    }

    // セッションが存在するか確認
    const sessionResult = await query(
      `SELECT * FROM selection_sessions WHERE id = ?`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return fail('Session not found', 404);
    }

    // セッションのステータスを確認
    const sessionRow = sessionResult.rows[0] as Record<string, unknown>;
    const session = toSelectionSessionDto(sessionRow);
    if (session.status === 'completed') {
      return fail('Session already completed', 400);
    }

    // 既存の結果があれば削除
    await query(
      `DELETE FROM exam_results WHERE session_id = ?`,
      [sessionId]
    );

    // 学生の応募情報を取得
    const applicationsResult = await query(`
      SELECT
        a.student_id,
        a.school_id,
        a.preference_order
      FROM applications a
      ORDER BY a.student_id, a.preference_order
    `);

    // 応募がない場合はエラー
    if (applicationsResult.rows.length === 0) {
      return fail('No applications found', 400);
    }

    // 学生ごとの希望校リストを作成
    const studentPreferences = new Map<number, number[]>();
    for (const app of applicationsResult.rows) {
      const studentId = Number(app.student_id);
      const schoolId = Number(app.school_id);

      if (isNaN(studentId) || isNaN(schoolId)) continue;

      if (!studentPreferences.has(studentId)) {
        studentPreferences.set(studentId, []);
      }
      studentPreferences.get(studentId)!.push(schoolId);
    }

    // 学生IDのリストを取得
    const studentIds = Array.from(studentPreferences.keys());

    // ランダムな成績を生成（0〜100点）
    const scores = generateRandomScores(studentIds, 0, 100);

    // 高校情報を取得
    const schoolsResult = await query(`
      SELECT id, capacity FROM schools
    `);

    // DAアルゴリズム用のデータを準備
    const students: Student[] = studentIds.map(id => ({
      id,
      score: scores.get(id) || 0,
      preferences: studentPreferences.get(id) || []
    }));

    const schools: School[] = schoolsResult.rows.map((row) => {
      const school = row as unknown as SchoolRow;
      const id = Number(school.id);
      const capacity = Number(school.capacity);

      if (isNaN(id) || isNaN(capacity)) {
        return { id: 0, capacity: 0 }; // ダミーデータ（後でフィルタリング）
      }

      return { id, capacity };
    }).filter(school => school.id !== 0); // 無効なデータを除外

    // DAアルゴリズムを実行
    const matchResults = runDAAlgorithm(students, schools);

    // 結果をデータベースに保存
    // 試験結果とマッチング結果を保存
    for (const student of students) {
      const matchResult = matchResults.find(r => r.studentId === student.id);
      if (matchResult) {
        await query(
          `
          INSERT INTO exam_results (
            session_id,
            student_id,
            score,
            matched_school_id
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            sessionId,
            student.id,
            student.score,
            matchResult.schoolId
          ]
        );
      }
    }

    // セッションのステータスを更新
    await query(
      `
      UPDATE selection_sessions
      SET status = 'completed'
      WHERE id = ?
      `,
      [sessionId]
    );

    // 結果の概要を取得
    const summaryResult = await query(`
      SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN matched_school_id IS NOT NULL THEN 1 END) as matched_students,
        AVG(score) as average_score
      FROM exam_results
      WHERE session_id = ?
    `, [sessionId]);

    // 学校ごとのマッチング数を取得
    const schoolsMatchResult = await query(`
      SELECT s.id, s.name, s.capacity, COUNT(er.student_id) as matched_count
      FROM schools s
      LEFT JOIN exam_results er ON s.id = er.matched_school_id AND er.session_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `, [sessionId]);

    return ok({
      session: {
        ...session,
        status: 'completed'
      },
      summary: summaryResult.rows[0],
      schools: schoolsMatchResult.rows,
      totalMatches: matchResults.filter(r => r.schoolId !== null).length,
      totalStudents: students.length
    });
  } catch (error) {
    console.error(`[api/admin/sessions/${id}/run][POST] failed:`, error);
    return fail('Failed to run matching', 500, error);
  }
}
