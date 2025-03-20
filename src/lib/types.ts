/**
 * アプリケーションで使用する型定義
 */

/**
 * 学生の型定義
 */
export interface Student {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

/**
 * 高校の型定義
 */
export interface School {
  id: number;
  name: string;
  location: string;
  capacity: number;
  created_at: string;
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
}

/**
 * 試験結果の型定義
 */
export interface ExamResult {
  id: number;
  session_id: number;
  student_id: number;
  score: number;
  matched_school_id: number | null;
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
  session: SelectionSession;
  summary: MatchingSummary;
  schools: SchoolMatchResult[];
  totalMatches: number;
  totalStudents: number;
}
