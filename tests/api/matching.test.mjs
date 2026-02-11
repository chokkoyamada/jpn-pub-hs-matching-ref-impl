import { describe, expect, it } from 'vitest';

import { runMatching } from '../../src/lib/matching/da-algorithm';
import { applySafetyFirstStrategy } from '../../src/lib/matching/strategy';

const students = [
  { id: 1, score: 90, preferences: [1, 2] },
  { id: 2, score: 80, preferences: [1, 2] },
  { id: 3, score: 70, preferences: [2, 1] },
];

const schools = [
  { id: 1, capacity: 1 },
  { id: 2, capacity: 2 },
];

describe('matching algorithms', () => {
  it('returns deterministic assignment for baseline', () => {
    const outcome = runMatching('baseline', students, schools);
    const resultMap = new Map(outcome.results.map((r) => [r.studentId, r.schoolId]));

    expect(resultMap.get(1)).toBe(1);
    expect(resultMap.get(2)).toBe(2);
    expect(resultMap.get(3)).toBe(2);
    expect(outcome.summary.matchedStudents).toBe(3);
  });

  it('keeps capacity constraints for DA', () => {
    const outcome = runMatching('da', students, schools);
    const counts = outcome.results.reduce((acc, result) => {
      if (result.schoolId !== null) {
        acc.set(result.schoolId, (acc.get(result.schoolId) ?? 0) + 1);
      }
      return acc;
    }, new Map());

    for (const school of schools) {
      expect(counts.get(school.id) ?? 0).toBeLessThanOrEqual(school.capacity);
    }

    expect(outcome.trace.some((step) => step.action === 'hold')).toBe(true);
  });

  it('models strategic down-ranking in baseline scenario', () => {
    const strategic = applySafetyFirstStrategy(
      [
        { id: 1, score: 95, preferences: [1, 2] },
        { id: 2, score: 70, preferences: [1, 2] },
        { id: 3, score: 60, preferences: [1, 2] },
      ],
      [
        { id: 1, capacity: 1 },
        { id: 2, capacity: 2 },
      ]
    );

    expect(strategic.find((s) => s.id === 1)?.preferences[0]).toBe(1);
    expect(strategic.find((s) => s.id === 2)?.preferences[0]).toBe(2);
    expect(strategic.find((s) => s.id === 3)?.preferences[0]).toBe(2);
  });
});
