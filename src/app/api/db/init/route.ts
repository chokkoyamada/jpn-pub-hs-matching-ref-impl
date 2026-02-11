import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/schema';

/**
 * データベース初期化APIエンドポイント
 * GET /api/db/init
 *
 * データベーススキーマの作成とサンプルデータの挿入を行う
 */
export async function GET() {
  try {
    await initializeDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing database:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
