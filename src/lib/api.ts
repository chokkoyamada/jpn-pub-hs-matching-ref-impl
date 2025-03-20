/**
 * API通信用のユーティリティ関数
 */

/**
 * APIリクエストの基本設定
 */
const API_BASE_URL = '/api';

/**
 * APIレスポンスの型定義
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * GETリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @returns レスポンスデータ
 */
export async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      message: 'APIリクエストに失敗しました',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * POSTリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @param body リクエストボディ
 * @returns レスポンスデータ
 */
export async function postData<T, U = any>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API post error:', error);
    return {
      success: false,
      message: 'APIリクエストに失敗しました',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * PUTリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @param body リクエストボディ
 * @returns レスポンスデータ
 */
export async function putData<T, U = any>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API put error:', error);
    return {
      success: false,
      message: 'APIリクエストに失敗しました',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * DELETEリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @returns レスポンスデータ
 */
export async function deleteData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API delete error:', error);
    return {
      success: false,
      message: 'APIリクエストに失敗しました',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
