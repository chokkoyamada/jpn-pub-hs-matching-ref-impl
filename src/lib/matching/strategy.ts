import type { School, Student } from '@/lib/matching/types';

function estimateRiskCutoffs(students: Student[], schools: School[]): Map<number, number> {
  const capacityBySchool = new Map<number, number>(schools.map((school) => [school.id, school.capacity]));
  const interestedScores = new Map<number, number[]>();

  for (const student of students) {
    for (const schoolId of student.preferences) {
      if (!interestedScores.has(schoolId)) {
        interestedScores.set(schoolId, []);
      }
      interestedScores.get(schoolId)!.push(student.score);
    }
  }

  const cutoffs = new Map<number, number>();
  for (const school of schools) {
    const scores = [...(interestedScores.get(school.id) ?? [])].sort((a, b) => b - a);
    const capacity = capacityBySchool.get(school.id) ?? 0;

    if (capacity <= 0) {
      cutoffs.set(school.id, Number.POSITIVE_INFINITY);
      continue;
    }

    if (scores.length < capacity) {
      cutoffs.set(school.id, Number.NEGATIVE_INFINITY);
      continue;
    }

    cutoffs.set(school.id, scores[capacity - 1]);
  }

  return cutoffs;
}

/**
 * 現行制度で起きる「志望校下げ」を簡易モデル化する。
 * 第1志望の推定ボーダーに届かない場合、届くまで志望順位を下げる。
 */
export function applySafetyFirstStrategy(students: Student[], schools: School[]): Student[] {
  const cutoffs = estimateRiskCutoffs(students, schools);

  return students.map((student) => {
    if (student.preferences.length <= 1) {
      return student;
    }

    let safeIndex = 0;
    for (let i = 0; i < student.preferences.length; i += 1) {
      const schoolId = student.preferences[i];
      const cutoff = cutoffs.get(schoolId) ?? Number.POSITIVE_INFINITY;
      if (student.score >= cutoff) {
        safeIndex = i;
        break;
      }
      safeIndex = i + 1;
    }

    if (safeIndex <= 0) {
      return student;
    }

    const truncated = student.preferences.slice(Math.min(safeIndex, student.preferences.length - 1));

    return {
      ...student,
      preferences: truncated,
    };
  });
}
