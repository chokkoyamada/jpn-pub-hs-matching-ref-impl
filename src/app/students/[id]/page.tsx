'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { fetchData } from '@/lib/api';
import { getLatestCompletedSession, toUiErrorMessage } from '@/lib/client-utils';
import { School, Application, ExamResult, SelectionSession } from '@/lib/types';
import ApplicationForm from '@/components/students/ApplicationForm';
import { use } from 'react';

interface TraceStep {
  round: number;
  studentId: number;
  schoolId: number;
  action: 'propose' | 'hold' | 'reject' | 'finalize';
  reason?: string;
}

interface ComparisonSummary {
  baseline: {
    summary: {
      firstChoiceRate: number;
      unmatchedCount: number;
      totalStudents: number;
      preferenceStats: number[];
      preferenceRates: number[];
    };
  };
  da: {
    summary: {
      firstChoiceRate: number;
      unmatchedCount: number;
      totalStudents: number;
      preferenceStats: number[];
      preferenceRates: number[];
    };
  };
  delta: {
    firstChoiceRate: number;
    unmatchedCount: number;
  };
}

interface TraceResponse {
  algorithm: 'baseline' | 'da';
  trace: TraceStep[];
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
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.order} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">第{item.order}希望</p>
          <p className="mt-1 text-xs text-slate-500">現行: {item.baselineCount}人 ({item.baseline.toFixed(1)}%)</p>
          <p className="text-xs text-blue-700">DA: {item.daCount}人 ({item.da.toFixed(1)}%)</p>
        </div>
      ))}
    </div>
  );
}

function actionLabel(action: TraceStep['action']) {
  switch (action) {
    case 'propose':
      return '応募';
    case 'hold':
      return '保留';
    case 'reject':
      return '拒否';
    case 'finalize':
      return '確定';
    default:
      return action;
  }
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = Number(resolvedParams.id);

  const [applications, setApplications] = useState<Application[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonSummary | null>(null);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [traceIndex, setTraceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const applicationsResponse = await fetchData<Application[]>(`/students/${studentId}/applications`);
        if (applicationsResponse.success && applicationsResponse.data) {
          setApplications(applicationsResponse.data);
        }

        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }

        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          const latestSession = getLatestCompletedSession(sessionsResponse.data);
          if (latestSession) {
            setSessionId(latestSession.id);

            const resultsResponse = await fetchData<ExamResult[]>(
              `/students/${studentId}/results?session_id=${latestSession.id}`
            );
            if (resultsResponse.success && resultsResponse.data && resultsResponse.data.length > 0) {
              setExamResult(resultsResponse.data[0]);
            }

            const comparisonResponse = await fetchData<ComparisonSummary>(
              `/admin/sessions/${latestSession.id}/comparison`
            );
            if (comparisonResponse.success && comparisonResponse.data) {
              setComparison(comparisonResponse.data);
            }

            const traceResponse = await fetchData<TraceResponse>(
              `/admin/sessions/${latestSession.id}/trace?algorithm=da`
            );
            if (traceResponse.success && traceResponse.data) {
              const studentTrace = traceResponse.data.trace.filter((step) => step.studentId === studentId);
              setTrace(studentTrace);
              setTraceIndex(studentTrace.length > 0 ? 1 : 0);
            }
          }
        }
      } catch (err) {
        setError(toUiErrorMessage(err instanceof Error ? err.message : undefined));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleApplicationSuccess = async () => {
    setShowApplicationForm(false);

    try {
      const response = await fetchData<Application[]>(`/students/${studentId}/applications`);
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err) {
      console.error('応募情報の再取得に失敗しました:', err);
    }
  };

  const visibleTrace = useMemo(() => trace.slice(0, traceIndex), [trace, traceIndex]);

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card px-6 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">学生詳細</h1>
        <p className="mt-2 text-slate-600">応募状況とマッチング結果を確認し、希望校を編集できます。</p>
      </section>

      {showApplicationForm ? (
        <ApplicationForm studentId={studentId} onSuccess={handleApplicationSuccess} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>応募状況</CardTitle>
            <CardDescription>あなたの高校への応募状況です</CardDescription>
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
            ) : applications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-slate-600">応募情報がありません</p>
                <p className="mt-2 text-sm text-slate-500">「応募情報を編集」ボタンから応募を開始してください</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>希望順位</TableHead>
                    <TableHead>高校名</TableHead>
                    <TableHead>所在地</TableHead>
                    <TableHead>定員</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const school = schools.find((s) => s.id === app.school_id);
                    return (
                      <TableRow key={app.id}>
                        <TableCell>{app.preference_order}</TableCell>
                        <TableCell>{app.school_name || (school ? school.name : '-')}</TableCell>
                        <TableCell>{app.school_location || (school ? school.location : '-')}</TableCell>
                        <TableCell>{school ? school.capacity : '-'}</TableCell>
                        <TableCell>
                          <span className="status-chip status-chip-success">応募済み</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowApplicationForm(true)}>応募情報を編集</Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>制度比較サマリー</CardTitle>
          <CardDescription>現行方式は志望校下げ（安全志向）を考慮して比較</CardDescription>
        </CardHeader>
        <CardContent>
          {comparison ? (
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">第一志望到達率（現行）</p>
                  <p className="text-2xl font-bold text-slate-900">{comparison.baseline.summary.firstChoiceRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">第一志望到達率（DA）</p>
                  <p className="text-2xl font-bold text-blue-700">{comparison.da.summary.firstChoiceRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">差分（DA - 現行）</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {comparison.delta.firstChoiceRate >= 0 ? '+' : ''}
                    {comparison.delta.firstChoiceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <PreferenceDistributionCards
                baselineRates={comparison.baseline.summary.preferenceRates}
                daRates={comparison.da.summary.preferenceRates}
                baselineStats={comparison.baseline.summary.preferenceStats}
                daStats={comparison.da.summary.preferenceStats}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              比較データはまだありません
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DAアルゴリズムの見える化</CardTitle>
          <CardDescription>「応募→保留→拒否→再応募」の流れを段階表示</CardDescription>
        </CardHeader>
        <CardContent>
          {trace.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setTraceIndex(0)}>
                  リセット
                </Button>
                <Button
                  onClick={() => setTraceIndex((prev) => Math.min(prev + 1, trace.length))}
                  disabled={traceIndex >= trace.length}
                >
                  次のステップ
                </Button>
                <span className="text-sm text-slate-600">
                  {traceIndex} / {trace.length} ステップ
                </span>
                {sessionId && <span className="text-xs text-slate-500">セッションID: {sessionId}</span>}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                {visibleTrace.length === 0 ? (
                  <p className="text-sm text-slate-600">「次のステップ」で進行を開始できます。</p>
                ) : (
                  <ul className="space-y-2">
                    {visibleTrace.map((step, index) => {
                      const schoolName = schools.find((school) => school.id === step.schoolId)?.name ?? `高校ID:${step.schoolId}`;
                      return (
                        <li
                          key={`${step.round}-${step.studentId}-${step.schoolId}-${step.action}-${index}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <span className="mr-2 text-xs font-semibold text-slate-500">Round {step.round}</span>
                          <span className="font-semibold text-slate-900">{actionLabel(step.action)}</span>
                          <span className="ml-2">{schoolName}</span>
                          {step.reason && <span className="ml-2 text-slate-500">({step.reason})</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              トレースデータがありません
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>マッチング結果</CardTitle>
          <CardDescription>マッチングアルゴリズムによる結果</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center">
              <p>読み込み中...</p>
            </div>
          ) : examResult ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="mb-2 text-xl font-semibold text-blue-900">
                {examResult.matched_school_id ? (
                  <>合格: {examResult.school_name || schools.find((s) => s.id === examResult.matched_school_id)?.name || '不明な高校'}</>
                ) : (
                  <>不合格</>
                )}
              </h3>
              <p className="text-blue-700">あなたの成績: {examResult.score}点</p>
              {examResult.matched_school_id !== null && examResult.matched_preference_order && (
                <p className="text-blue-700">合格した希望順位: 第{examResult.matched_preference_order}希望</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="mb-2 text-slate-600">マッチング結果はまだ公開されていません</p>
              <p className="text-sm text-slate-500">結果は選考セッション終了後に公開されます</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>高校一覧</CardTitle>
          <CardDescription>応募可能な高校の一覧</CardDescription>
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>高校名</TableHead>
                  <TableHead>所在地</TableHead>
                  <TableHead>定員</TableHead>
                  <TableHead>詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.location}</TableCell>
                    <TableCell>{school.capacity}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">詳細</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
