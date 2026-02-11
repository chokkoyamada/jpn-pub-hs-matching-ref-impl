import type { SelectionSession } from '@/lib/types';

export const DEFAULT_UI_ERROR = 'データの取得中にエラーが発生しました。時間をおいて再試行してください。';

export function toUiErrorMessage(message?: string, fallback: string = DEFAULT_UI_ERROR): string {
  if (!message) return fallback;
  return message;
}

export function getLatestCompletedSession(sessions: SelectionSession[]): SelectionSession | null {
  const completed = sessions.filter((session) => session.status === 'completed');
  if (completed.length === 0) return null;

  return [...completed].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];
}
