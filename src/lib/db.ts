import { createClient } from '@libsql/client';
import type { InValue } from '@libsql/client';

/**
 * Tursoデータベースクライアント
 * 環境変数からデータベースURLと認証トークンを取得して接続
 */
const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export default client;

/**
 * SQLクエリを実行する関数
 * @param sql SQLクエリ
 * @param params クエリパラメータ
 * @returns クエリ結果
 */
export async function query(sql: string, params: InValue[] = []) {
  try {
    const result = await client.execute({ sql, args: params });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * トランザクションを実行する関数
 * @param callback トランザクション内で実行するコールバック関数
 * @returns コールバック関数の戻り値
 */
export async function transaction<T>(callback: () => Promise<T>): Promise<T> {
  try {
    await client.execute({ sql: 'BEGIN TRANSACTION' });
    const result = await callback();
    await client.execute({ sql: 'COMMIT' });
    return result;
  } catch (error) {
    try {
      await client.execute({ sql: 'ROLLBACK' });
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
      // ロールバックエラーは無視して元のエラーをスローする
    }
    console.error('Transaction error:', error);
    throw error;
  }
}
