import type { ApiResponse } from '@/lib/types';

/**
 * API通信用のユーティリティ関数
 */
const API_BASE_URL = '/api';

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (typeof payload === 'object' && payload !== null) {
    const typed = payload as ApiResponse<T>;
    if (response.ok) {
      return typed;
    }

    return {
      success: false,
      message: typed.message || `HTTP ${response.status} エラーが発生しました`,
      error: typed.error || typed.message || `HTTP ${response.status}`,
    };
  }

  if (!response.ok) {
    return {
      success: false,
      message: `HTTP ${response.status} エラーが発生しました`,
      error: `HTTP ${response.status}`,
    };
  }

  return {
    success: false,
    message: 'APIレスポンスの形式が不正です',
    error: 'Invalid response format',
  };
}

export async function requestJson<T, U = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: U
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return await parseApiResponse<T>(response);
  } catch (error) {
    console.error(`[api:${method}] ${endpoint}`, error);
    return {
      success: false,
      message: '通信に失敗しました。ネットワーク状態をご確認ください。',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  return requestJson<T>('GET', endpoint);
}

export async function putData<T, U = unknown>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  return requestJson<T, U>('PUT', endpoint, body);
}

export async function deleteData<T>(endpoint: string): Promise<ApiResponse<T>> {
  return requestJson<T>('DELETE', endpoint);
}

export async function postData<T, U = unknown>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  return requestJson<T, U>('POST', endpoint, body);
}
