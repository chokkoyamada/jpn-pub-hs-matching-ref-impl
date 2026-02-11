import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    init
  );
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, message },
    { status: 201 }
  );
}

export function fail(message: string, status: number, error?: unknown) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      message,
      error: error instanceof Error ? error.message : error ? String(error) : undefined,
    },
    { status }
  );
}
