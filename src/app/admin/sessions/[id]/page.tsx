'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { fetchData } from '@/lib/api';
import { toUiErrorMessage } from '@/lib/client-utils';
import { SelectionSession, ExamResult, School, Student, ComparisonSummaryResponse } from '@/lib/types';
import { use } from 'react';

function toPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function SankeyLikeRow({ label, baseline, da }: { label: string; baseline: number; da: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="space-y-1">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>現行</span>
            <span>{toPercent(baseline)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-slate-500" style={{ width: `${Math.max(0, Math.min(100, baseline))}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-blue-700">
            <span>DA</span>
            <span>{toPercent(da)}</span>
          </div>
          <div className="h-2 rounded-full bg-blue-100">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, da))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceDistributionCards({
  baselineRates,
  daRates,
  baselineStats,
  daStats,
}: {
  baselineRates: number[];
  daRates: number[];
  baselineStats: number[];
  daStats: number[];
}) {
  const length = Math.max(baselineRates.length, daRates.length, baselineStats.length, daStats.length, 5);
  const items = Array.from({ length }, (_, index) => ({
    order: index + 1,
    baseline: baselineRates[index] ?? 0,
    da: daRates[index] ?? 0,
    baselineCount: baselineStats[index] ?? 0,
    daCount: daStats[index] ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.order} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">第{item.order}希望</p>
          <p className="mt-1 text-xs text-slate-500">現行: {item.baselineCount}人 ({toPercent(item.baseline)})</p>
          <p className="text-xs text-blue-700">DA: {item.daCount}人 ({toPercent(item.da)})</p>
        </div>
      ))}
    </div>
  );
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = Number(resolvedParams.id);

  const [session, setSession] = useState<SelectionSession | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [comparison, setComparison] = useState<ComparisonSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const sessionResponse = await fetchData<{
          session: SelectionSession & {
            summary: { total_students: number; matched_students: number; average_score: number };
            schools: Array<{ id: number; name: string; capacity: number; matched_count: number }>;
          };
        }>(`/admin/sessions/${sessionId}`);
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data.session);
        }

        const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${sessionId}/results`);
        if (resultsResponse.success && resultsResponse.data) {
          setExamResults(resultsResponse.data);
        }

        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }

        const studentsResponse = await fetchData<Student[]>('/students');
        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data);
        }

        const comparisonResponse = await fetchData<ComparisonSummaryResponse>(`/admin/sessions/${sessionId}/comparison`);
        if (comparisonResponse.success && comparisonResponse.data) {
          setComparison(comparisonResponse.data);
        }
      } catch (err) {
        setError(toUiErrorMessage(err instanceof Error ? err.message : undefined));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const matchedStudentsCount = examResults.filter((result) => result.matched_school_id !== null).length;

  const averageScore =
    examResults.length > 0
      ? examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length
      : 0;

  const currentAlgorithm = examResults[0]?.algorithm ?? 'baseline';

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card px-6 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">選考セッション詳細</h1>
        <p className="mt-2 text-slate-600">セッションの状態・統計・配属結果を確認します。</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>セッション情報</CardTitle>
          <CardDescription>選考セッションの基本情報</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center">
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : session ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">セッションID</h3>
                  <p className="mt-1">{session.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">作成日時</h3>
                  <p className="mt-1">{new Date(session.created_at).toLocaleString('ja-JP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
                  <p className="mt-1">
                    {session.status === 'completed' ? (
                      <span className="status-chip status-chip-success">完了</span>
                    ) : (
                      <span className="status-chip status-chip-warning">保留中</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">マッチング数</h3>
                  <p className="mt-1">
                    {matchedStudentsCount} / {students.length}
                  </p>
                </div>
              </div>

              {session.status === 'completed' && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <h3 className="font-medium text-blue-800">マッチング率</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {students.length > 0 ? ((matchedStudentsCount / students.length) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">平均スコア</h3>
                    <p className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}点</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-medium text-slate-700">実行アルゴリズム</h3>
                    <p className="text-2xl font-bold text-slate-900">{currentAlgorithm === 'da' ? 'DA' : '現行'}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-slate-600">セッション情報がありません</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>制度比較（現行 vs DA）</CardTitle>
          <CardDescription>現行は「志望校下げ（安全志向）」を考慮した比較指標</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center">読み込み中...</div>
          ) : comparison ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">第一志望到達率（現行）</p>
                  <p className="text-2xl font-bold text-slate-900">{toPercent(comparison.baseline.summary.firstChoiceRate)}</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">第一志望到達率（DA）</p>
                  <p className="text-2xl font-bold text-blue-700">{toPercent(comparison.da.summary.firstChoiceRate)}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">差分（DA - 現行）</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {comparison.delta.firstChoiceRate >= 0 ? '+' : ''}
                    {toPercent(comparison.delta.firstChoiceRate)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-base font-semibold text-slate-900">希望順位分布カード</h3>
                <PreferenceDistributionCards
                  baselineRates={comparison.baseline.summary.preferenceRates}
                  daRates={comparison.da.summary.preferenceRates}
                  baselineStats={comparison.baseline.summary.preferenceStats}
                  daStats={comparison.da.summary.preferenceStats}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-base font-semibold text-slate-900">希望順位フロー（簡易サンキー）</h3>
                <div className="space-y-4">
                  <SankeyLikeRow
                    label="第一志望での配属"
                    baseline={comparison.baseline.summary.preferenceRates[0] ?? 0}
                    da={comparison.da.summary.preferenceRates[0] ?? 0}
                  />
                  <SankeyLikeRow
                    label="第二志望での配属"
                    baseline={comparison.baseline.summary.preferenceRates[1] ?? 0}
                    da={comparison.da.summary.preferenceRates[1] ?? 0}
                  />
                  <SankeyLikeRow
                    label="未配属率"
                    baseline={(comparison.baseline.summary.unmatchedCount / Math.max(1, comparison.baseline.summary.totalStudents)) * 100}
                    da={(comparison.da.summary.unmatchedCount / Math.max(1, comparison.da.summary.totalStudents)) * 100}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              比較データがありません
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>マッチング結果</CardTitle>
          <CardDescription>学生と高校のマッチング結果一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center">
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : examResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学生</TableHead>
                  <TableHead>成績</TableHead>
                  <TableHead>マッチング結果</TableHead>
                  <TableHead>合格希望順位</TableHead>
                  <TableHead>結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examResults.map((result) => {
                  const student = students.find((s) => s.id === result.student_id);
                  const matchedSchool = schools.find((s) => s.id === result.matched_school_id);

                  return (
                    <TableRow key={result.id}>
                      <TableCell>{student?.name || `ID: ${result.student_id}`}</TableCell>
                      <TableCell>{result.score}点</TableCell>
                      <TableCell>{matchedSchool ? matchedSchool.name : '未マッチング'}</TableCell>
                      <TableCell>
                        {result.matched_school_id !== null && result.matched_preference_order
                          ? `第${result.matched_preference_order}希望`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {matchedSchool ? (
                          <span className="status-chip status-chip-success">合格</span>
                        ) : (
                          <span className="status-chip status-chip-danger">不合格</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="mb-2 text-slate-600">マッチング結果はまだありません</p>
              {session?.status === 'pending' && (
                <p className="text-sm text-slate-500">セッションを実行するとここに結果が表示されます</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
