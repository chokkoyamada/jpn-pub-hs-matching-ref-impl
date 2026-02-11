/**
 * アプリケーションで使用する共有型定義
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 学生のAPI DTO
 * DBスキーマと後方互換の両方を考慮して optional を許容する
 */
export interface Student {
  id: number;
  name: string;
  contact_info?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

/**
 * 高校のAPI DTO
 */
export interface School {
  id: number;
  name: string;
  location?: string | null;
  capacity: number;
  created_at?: string;
}

/**
 * 応募情報の型定義
 */
export interface Application {
  id: number;
  student_id: number;
  school_id: number;
  preference_order: number;
  school_name?: string;
  school_location?: string;
}

/**
 * 応募情報の送信用型定義
 */
export interface ApplicationSubmission {
  applications: {
    school_id: number;
    preference_order: number;
  }[];
}

/**
 * 選考セッションの型定義
 */
export interface SelectionSession {
  id: number;
  created_at: string;
  status: 'pending' | 'completed';
  summary?: {
    total_students: number;
    matched_students: number;
    average_score: number;
  };
  schools?: Array<{
    id: number;
    name: string;
    capacity: number;
    matched_count: number;
  }>;
}

/**
 * 試験結果の型定義
 */
export interface ExamResult {
  id: number;
  session_id: number;
  student_id: number;
  score: number;
  algorithm?: 'baseline' | 'da';
  matched_school_id: number | null;
  matched_preference_order?: number | null;
  student_name?: string;
  school_name?: string;
}

/**
 * マッチング結果の概要型定義
 */
export interface MatchingSummary {
  total_students: number;
  matched_students: number;
  average_score: number;
}

/**
 * 高校のマッチング結果型定義
 */
export interface SchoolMatchResult {
  id: number;
  name: string;
  capacity: number;
  matched_count: number;
}

/**
 * マッチング実行結果の型定義
 */
export interface MatchingResult {
  algorithm?: 'baseline' | 'da';
  session: SelectionSession;
  summary: MatchingSummary;
  schools: SchoolMatchResult[];
  totalMatches: number;
  totalStudents: number;
}

export interface ComparisonSummaryResponse {
  baseline: {
    summary: {
      totalStudents: number;
      matchedStudents: number;
      unmatchedCount: number;
      matchRate: number;
      preferenceStats: number[];
      preferenceRates: number[];
      firstChoiceRate: number;
    };
  };
  da: {
    summary: {
      totalStudents: number;
      matchedStudents: number;
      unmatchedCount: number;
      matchRate: number;
      preferenceStats: number[];
      preferenceRates: number[];
      firstChoiceRate: number;
    };
  };
  delta: {
    firstChoiceRate: number;
    unmatchedCount: number;
  };
}

export interface SessionSummary {
  total_students: number;
  matched_students: number;
  average_score: number;
}
