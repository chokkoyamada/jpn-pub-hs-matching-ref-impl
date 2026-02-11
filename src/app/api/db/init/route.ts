import { initializeDatabase } from '@/lib/schema';
import { fail, ok } from '@/lib/api-response';

/**
 * データベース初期化APIエンドポイント
 * GET /api/db/init
 *
 * データベーススキーマの作成とサンプルデータの挿入を行う
 */
export async function GET() {
  try {
    await initializeDatabase();

    return ok({ initialized: true }, { status: 200 });
  } catch (error) {
    console.error('[api/db/init][GET] failed:', error);
    return fail('Failed to initialize database', 500, error);
  }
}
