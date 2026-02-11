import { runBaselineMatching, summarizeResults } from '@/lib/matching/algorithms/baseline';
import { runStudentProposingDA } from '@/lib/matching/algorithms/student-proposing-da';
import type {
  MatchResult,
  MatchingAlgorithm,
  MatchingOutcome,
  School,
  Student,
} from '@/lib/matching/types';

export type {
  MatchResult,
  MatchingAlgorithm,
  MatchingOutcome,
  School,
  Student,
} from '@/lib/matching/types';

export function runMatching(
  algorithm: MatchingAlgorithm,
  students: Student[],
  schools: School[]
): MatchingOutcome {
  if (algorithm === 'da') {
    return runStudentProposingDA(students, schools);
  }
  return runBaselineMatching(students, schools);
}

/**
 * 後方互換: 既存の呼び出しは baseline 相当を返す
 */
export function runDAAlgorithm(students: Student[], schools: School[]): MatchResult[] {
  return runBaselineMatching(students, schools).results;
}

export function analyzeResults(results: MatchResult[], students: Student[]) {
  return summarizeResults(results, students);
}

/**
 * 再現可能な乱数生成（セッション比較時に同一スコアを使うため）
 */
export function generateRandomScores(
  studentIds: number[],
  min: number = 0,
  max: number = 100,
  seed: number = Date.now()
): Map<number, number> {
  const scores = new Map<number, number>();
  const range = max - min + 1;

  const random = (input: number) => {
    const x = Math.sin(input * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  studentIds.forEach((id, index) => {
    const value = Math.floor(random(id + index) * range) + min;
    scores.set(id, value);
  });

  return scores;
}
