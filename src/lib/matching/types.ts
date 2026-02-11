export interface Student {
  id: number;
  score: number;
  preferences: number[];
}

export interface School {
  id: number;
  capacity: number;
}

export interface MatchResult {
  studentId: number;
  schoolId: number | null;
}

export type MatchingAlgorithm = 'baseline' | 'da';

export type TraceAction = 'propose' | 'hold' | 'reject' | 'finalize';

export interface MatchingTraceStep {
  round: number;
  studentId: number;
  schoolId: number;
  action: TraceAction;
  reason?: string;
}

export interface MatchingSummary {
  totalStudents: number;
  matchedStudents: number;
  unmatchedCount: number;
  matchRate: number;
  preferenceStats: number[];
  preferenceRates: number[];
  firstChoiceRate: number;
}

export interface MatchingOutcome {
  results: MatchResult[];
  summary: MatchingSummary;
  trace: MatchingTraceStep[];
}
