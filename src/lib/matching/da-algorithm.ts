/**
 * 学生インターフェース
 */
export interface Student {
  id: number;
  score: number;
  preferences: number[]; // 学校IDのリスト（希望順）
}

/**
 * 高校インターフェース
 */
export interface School {
  id: number;
  capacity: number;
}

/**
 * マッチング結果インターフェース
 */
export interface MatchResult {
  studentId: number;
  schoolId: number | null;
}

/**
 * DAアルゴリズム（Deferred Acceptance Algorithm）を実行する関数
 * 学生を成績順にソートし、希望順位に従って高校に割り当てる
 *
 * @param students 学生のリスト（id, 成績, 希望順位）
 * @param schools 高校のリスト（id, 定員）
 * @returns マッチング結果のリスト
 */
export function runDAAlgorithm(
  students: Student[],
  schools: School[]
): MatchResult[] {
  // 成績順に学生をソート（降順）
  const sortedStudents = [...students].sort((a, b) => b.score - a.score);

  // 学校ごとの空き容量を追跡
  const schoolCapacity = new Map<number, number>();
  schools.forEach(school => {
    schoolCapacity.set(school.id, school.capacity);
  });

  // 結果を格納する配列
  const results: MatchResult[] = [];

  // 各学生について処理
  for (const student of sortedStudents) {
    let matched = false;

    // 学生の希望順位に従って学校を試す
    for (const schoolId of student.preferences) {
      const remainingCapacity = schoolCapacity.get(schoolId) || 0;

      // 空き容量があれば割り当て
      if (remainingCapacity > 0) {
        results.push({ studentId: student.id, schoolId });
        schoolCapacity.set(schoolId, remainingCapacity - 1);
        matched = true;
        break;
      }
    }

    // マッチしなかった場合
    if (!matched) {
      results.push({ studentId: student.id, schoolId: null });
    }
  }

  return results;
}

/**
 * マッチング結果を集計する関数
 *
 * @param results マッチング結果のリスト
 * @param students 学生のリスト
 * @returns 集計結果（マッチング率、希望順位ごとの割合など）
 */
export function analyzeResults(results: MatchResult[], students: Student[]) {
  const totalStudents = results.length;
  const matchedStudents = results.filter(r => r.schoolId !== null).length;
  const matchRate = totalStudents > 0 ? (matchedStudents / totalStudents) * 100 : 0;

  // 希望順位ごとの集計
  const preferenceStats = [0, 0, 0, 0, 0]; // 第1〜第5希望
  const unmatchedCount = totalStudents - matchedStudents;

  results.forEach(result => {
    if (result.schoolId === null) return;

    const student = students.find(s => s.id === result.studentId);
    if (!student) return;

    const preferenceIndex = student.preferences.indexOf(result.schoolId);
    if (preferenceIndex >= 0 && preferenceIndex < 5) {
      preferenceStats[preferenceIndex]++;
    }
  });

  // 希望順位ごとの割合
  const preferenceRates = preferenceStats.map(count =>
    totalStudents > 0 ? (count / totalStudents) * 100 : 0
  );

  return {
    totalStudents,
    matchedStudents,
    unmatchedCount,
    matchRate,
    preferenceStats,
    preferenceRates,
  };
}

/**
 * ランダムな成績を生成する関数
 *
 * @param studentIds 学生IDのリスト
 * @param min 最小値
 * @param max 最大値
 * @returns 学生IDと成績のマップ
 */
export function generateRandomScores(
  studentIds: number[],
  min: number = 0,
  max: number = 100
): Map<number, number> {
  const scores = new Map<number, number>();

  studentIds.forEach(id => {
    const score = Math.floor(Math.random() * (max - min + 1)) + min;
    scores.set(id, score);
  });

  return scores;
}
