import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * トップページコンポーネント
 * アプリケーションのホームページ
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* ヒーローセクション */}
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">公立高校マッチングシステム</h1>
        <p className="text-xl text-gray-600 mb-8">
          日本の公立高校入試制度の併願制とDAアルゴリズムによるマッチングの参考実装
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/students">
            <Button size="lg">学生向けページ</Button>
          </Link>
          <Link href="/schools">
            <Button size="lg" variant="outline">高校向けページ</Button>
          </Link>
          <Link href="/admin">
            <Button size="lg" variant="secondary">教育委員会向けページ</Button>
          </Link>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">システムの特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>併願制</CardTitle>
              <CardDescription>複数の高校を希望順位付きで申請</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                現在の単願制とは異なり、生徒は複数の高校を希望順位をつけて申請できます。
                これにより、より柔軟な進路選択が可能になります。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DAアルゴリズム</CardTitle>
              <CardDescription>効率的なマッチングを実現</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Deferred Acceptance（DA）アルゴリズムを使用して、
                生徒の希望と高校の定員を考慮した最適なマッチングを行います。
                このアルゴリズムは、経済学のノーベル賞を受賞した研究に基づいています。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>透明性の高い結果</CardTitle>
              <CardDescription>公平で説明可能なマッチング</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                マッチング結果は明確なルールに基づいており、
                生徒の成績と希望順位、高校の定員によって決定されます。
                結果の透明性が高く、公平な制度を実現します。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">システムの使い方</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <h3 className="text-xl font-semibold">学生：希望校の登録</h3>
              <p className="text-gray-600">
                学生は最大5校まで希望する高校を選択し、希望順位を設定します。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <h3 className="text-xl font-semibold">教育委員会：マッチング実行</h3>
              <p className="text-gray-600">
                教育委員会は入試終了後、生徒の成績データを基にマッチングを実行します。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <h3 className="text-xl font-semibold">結果確認</h3>
              <p className="text-gray-600">
                マッチング結果が公開され、学生は合格した高校を、高校は入学予定の学生を確認できます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
