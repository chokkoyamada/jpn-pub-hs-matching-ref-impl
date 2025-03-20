# 日本公立高校併願制マッチングシステム参考実装

このリポジトリは、日本の公立高校入試における併願制（複数の希望先を申告できる制度）と、DAアルゴリズム（Deferred Acceptance Algorithm）を用いたマッチングシステムの参考実装です。現在の単願制から併願制への移行を検討する際の参考として開発されました。

## 概要

現在の日本の公立高校入試制度では、ほとんどが単願制（一つの高校のみを志望できる）を採用していますが、この参考実装では併願制を導入し、以下のプロセスを実現します：

1. 学生は複数の高校に志望順位をつけて応募
2. 各高校は定員と入試結果（点数）に基づいて学生を評価
3. DAアルゴリズムを用いて、学生の志望順位と高校の評価を考慮した最適なマッチングを実現

## 技術スタック

- **フロントエンド**: Next.js, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: Turso (SQLite互換のエッジデータベース)
- **デプロイ**: Vercel (推奨)

## 主な機能

### 学生向け機能
- 複数の高校への志望登録（優先順位付き）
- 個人の試験結果とマッチング結果の確認
- 志望校の詳細情報閲覧

### 高校向け機能
- 学校情報の管理
- 応募者一覧の確認
- マッチング結果の確認

### 教育委員会向け機能
- マッチングセッションの管理と実行
- 全体の統計情報の確認
- 学生・高校データの管理

## セットアップ方法

### 前提条件
- Node.js 18.0.0以上
- pnpm（推奨）またはnpm、yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/jpn-pub-hs-matching-ref-impl.git
cd jpn-pub-hs-matching-ref-impl

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集してTursoのデータベース接続情報を設定
```

### データベースのセットアップ

1. [Turso CLI](https://docs.turso.tech/reference/cli)をインストール
2. Tursoにログインし、データベースを作成

```bash
turso auth login
turso db create jpn-hs-matching
turso db tokens create jpn-hs-matching
```

3. 取得したトークンと接続URLを`.env.local`ファイルに設定

```
TURSO_DB_URL=your-db-url
TURSO_DB_AUTH_TOKEN=your-auth-token
```

4. 初期データをロード

```bash
# 開発サーバーを起動
pnpm dev

# 別のターミナルで初期化APIを実行
curl -X POST http://localhost:3000/api/db/init
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開くとアプリケーションにアクセスできます。

## プロジェクト構造

```
src/
├── app/                  # Next.jsのApp Router
│   ├── admin/            # 教育委員会向けページ
│   ├── api/              # APIエンドポイント
│   ├── schools/          # 高校向けページ
│   ├── students/         # 学生向けページ
│   └── page.tsx          # トップページ
├── components/           # 再利用可能なコンポーネント
│   ├── schools/          # 高校関連コンポーネント
│   ├── students/         # 学生関連コンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ関数
│   ├── api.ts            # API通信用関数
│   ├── db.ts             # データベース接続
│   ├── schema.ts         # データベーススキーマ
│   ├── types.ts          # 型定義
│   └── matching/         # マッチングアルゴリズム
│       └── da-algorithm.ts  # DAアルゴリズム実装
└── public/               # 静的ファイル
```

## DAアルゴリズムについて

このシステムでは、Deferred Acceptance Algorithm（延期受入アルゴリズム）を実装しています。このアルゴリズムは以下の特徴を持ちます：

- 学生最適性: 学生にとって最適なマッチングを実現
- 戦略的操作不可能性: 学生が真の選好を申告するのが最適戦略となる
- 安定性: どの学生も高校も、現在のマッチングを一方的に改善できない

アルゴリズムの詳細な実装は`src/lib/matching/da-algorithm.ts`で確認できます。

## 参考資料

- [デジタル庁 教育分野のデジタル化に関する検討会](https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/cb8d084f-f9d3-4089-95db-11a9ae0dac5f/613899aa/20250110_policies_education_2024report_outline_01.pdf)
- [Gale-Shapley Algorithm](https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
