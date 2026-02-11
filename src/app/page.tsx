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
      <section className="surface-card relative overflow-hidden px-6 py-10 md:px-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(11,95,255,0.08),transparent_45%,rgba(15,118,110,0.1))]" />
        <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
          参考実装 / 公立高校入試制度
        </p>
        <h1 className="max-w-4xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
          公立高校マッチングシステム
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
          併願制とDAアルゴリズムを用いて、生徒の希望順位と高校定員をもとに
          公平かつ透明性のある配属結果を確認できます。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/students" className="inline-flex">
            <Button size="lg">学生向けページへ</Button>
          </Link>
          <Link href="/schools" className="inline-flex">
            <Button size="lg" variant="outline">高校向けページへ</Button>
          </Link>
          <Link href="/admin" className="inline-flex">
            <Button size="lg" variant="secondary">教育委員会向けページへ</Button>
          </Link>
        </div>
      </section>

      <section className="py-2">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">システムの特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>併願制</CardTitle>
              <CardDescription>複数の高校を希望順位付きで申請</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
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
              <p className="text-slate-700">
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
              <p className="text-slate-700">
                マッチング結果は明確なルールに基づいており、
                生徒の成績と希望順位、高校の定員によって決定されます。
                結果の透明性が高く、公平な制度を実現します。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="surface-card py-8 px-6 md:px-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">システムの使い方</h2>
        <div className="space-y-5">
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">学生: 希望校の登録</h3>
              <p className="text-slate-600">
                学生は最大5校まで希望する高校を選択し、希望順位を設定します。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">教育委員会: マッチング実行</h3>
              <p className="text-slate-600">
                教育委員会は入試終了後、生徒の成績データを基にマッチングを実行します。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">結果確認</h3>
              <p className="text-slate-600">
                マッチング結果が公開され、学生は合格した高校を、高校は入学予定の学生を確認できます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
