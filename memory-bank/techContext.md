# 技術コンテキスト：日本公立高校入試マッチングシステム

## 使用技術

### フロントエンド
- **Next.js 15.2.3**: Reactフレームワーク、App Routerを使用
- **React 19.0.0**: UIコンポーネントライブラリ
- **TypeScript**: 型安全な開発言語
- **TailwindCSS 4**: ユーティリティファーストのCSSフレームワーク

### バックエンド
- **Next.js API Routes**: サーバーサイドAPIエンドポイント
- **サーバーアクション**: フォーム処理とデータ変更のためのNext.js機能

### データベース
- **Turso**: SQLiteベースのエッジデータベース
- **SQL**: データベースクエリ言語

### 開発ツール
- **ESLint**: コード品質とスタイルの検証
- **TypeScript**: 静的型チェック

## 開発環境

### 必要条件
- Node.js 20.x以上
- npm, yarn, または pnpm
- Tursoアカウントとローカル開発用のTursoデータベース

### 開発サーバー起動
```bash
# 開発サーバー起動
npm run dev
# または
yarn dev
# または
pnpm dev
```

### ビルドとデプロイ
```bash
# プロダクションビルド
npm run build
# または
yarn build
# または
pnpm build

# プロダクションサーバー起動
npm run start
# または
yarn start
# または
pnpm start
```

## Turso統合

### セットアップ
1. Tursoアカウント作成とCLIインストール
2. データベース作成
3. 接続情報の取得
4. 環境変数の設定

### 接続設定
```typescript
// lib/db.ts
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default client;
```

### 使用方法
```typescript
// 例: 学生データの取得
import db from '@/lib/db';

export async function getStudents() {
  const result = await db.execute('SELECT * FROM students');
  return result.rows;
}
```

## データベーススキーマ

### 学生テーブル
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info TEXT
);
```

### 高校テーブル
```sql
CREATE TABLE schools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER NOT NULL
);
```

### 応募テーブル
```sql
CREATE TABLE applications (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  preference_order INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (school_id) REFERENCES schools(id),
  UNIQUE(student_id, school_id),
  UNIQUE(student_id, preference_order)
);
```

### 選考セッションテーブル
```sql
CREATE TABLE selection_sessions (
  id INTEGER PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
```

### 試験結果・マッチングテーブル
```sql
CREATE TABLE exam_results (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  matched_school_id INTEGER,
  FOREIGN KEY (session_id) REFERENCES selection_sessions(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (matched_school_id) REFERENCES schools(id)
);
```

## 技術的制約

### パフォーマンス
- デモ実装のため、大規模データ処理の最適化は含まれない
- 実際の本番環境では、より堅牢なデータベースとキャッシュ戦略が必要

### セキュリティ
- デモ実装のため、本格的な認証・認可システムは含まれない
- 実際の本番環境では、適切な認証・認可と入力検証が必要

### スケーラビリティ
- 小〜中規模の利用を想定
- 大規模な利用には、より堅牢なインフラストラクチャが必要

## 依存関係

### 主要パッケージ
- **next**: Reactフレームワーク
- **react**, **react-dom**: UIライブラリ
- **typescript**: 型システム
- **tailwindcss**: CSSフレームワーク
- **@libsql/client**: Tursoクライアント

### 開発依存関係
- **eslint**: コード品質チェック
- **@types/node**, **@types/react**, **@types/react-dom**: TypeScript型定義

## DAアルゴリズム実装

DAアルゴリズム（Deferred Acceptance Algorithm）は、以下のように実装します：

```typescript
// lib/matching/da-algorithm.ts
interface Student {
  id: number;
  score: number;
  preferences: number[]; // 学校IDのリスト（希望順）
}

interface School {
  id: number;
  capacity: number;
}

interface MatchResult {
  studentId: number;
  schoolId: number | null;
}

export function runDAAlgorithm(
  students: Student[],
  schools: School[]
): MatchResult[] {
  // 成績順に学生をソート（降順）
  const sortedStudents = [...students].sort((a, b) => b.score - a.score);

  // 学校ごとの空き容量を追跡
  const schoolCapacity = new Map<number, number>();
  schools.forEach(school => {
    schoolCapacity.set(school.id, school.capacity);
  });

  // 結果を格納する配列
  const results: MatchResult[] = [];

  // 各学生について処理
  for (const student of sortedStudents) {
    let matched = false;

    // 学生の希望順に学校を試す
    for (const schoolId of student.preferences) {
      const remainingCapacity = schoolCapacity.get(schoolId) || 0;

      // 空き容量があれば割り当て
      if (remainingCapacity > 0) {
        results.push({ studentId: student.id, schoolId });
        schoolCapacity.set(schoolId, remainingCapacity - 1);
        matched = true;
        break;
      }
    }

    // マッチしなかった場合
    if (!matched) {
      results.push({ studentId: student.id, schoolId: null });
    }
  }

  return results;
}
```

## API設計

### 学生関連API
- `GET /api/students`: 学生一覧取得
- `GET /api/students/:id`: 特定の学生情報取得
- `POST /api/students/:id/applications`: 学生の応募登録
- `GET /api/students/:id/results`: 学生のマッチング結果取得

### 高校関連API
- `GET /api/schools`: 高校一覧取得
- `GET /api/schools/:id`: 特定の高校情報取得
- `GET /api/schools/:id/applicants`: 高校の応募者一覧取得
- `GET /api/schools/:id/matched-students`: 高校のマッチング結果取得

### 教育委員会関連API
- `GET /api/admin/schools`: 高校一覧管理用取得
- `POST /api/admin/schools`: 高校追加
- `PUT /api/admin/schools/:id`: 高校情報更新
- `GET /api/admin/sessions`: 選考セッション一覧取得
- `POST /api/admin/sessions`: 選考セッション作成
- `POST /api/admin/sessions/:id/run`: マッチング実行
- `GET /api/admin/sessions/:id/results`: 選考セッション結果取得
