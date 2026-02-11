'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { fetchData } from '@/lib/api';
import { getLatestCompletedSession, toUiErrorMessage } from '@/lib/client-utils';
import { School, Application, ExamResult, SelectionSession } from '@/lib/types';

import { use } from 'react';

/**
 * 高校詳細ページコンポーネント
 * 高校が応募状況やマッチング結果を確認するページ
 */
export default function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // URLパスからIDを取得
  const resolvedParams = use(params);
  const schoolId = Number(resolvedParams.id);

  // 状態管理
  const [school, setSchool] = useState<School | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchResults, setMatchResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    location: string;
    capacity: number;
  } | null>(null);

  // データ取得
  useEffect(() => {
    const fetchSchoolData = async () => {
      setLoading(true);
      try {
        // 高校情報を取得
        const schoolResponse = await fetchData<{ school: School }>(`/schools/${schoolId}`);
        if (schoolResponse.success && schoolResponse.data) {
          setSchool(schoolResponse.data.school);
        }

        // 応募情報を取得
        const applicationsResponse = await fetchData<Application[]>(`/schools/${schoolId}/applications`);
        if (applicationsResponse.success && applicationsResponse.data) {
          setApplications(applicationsResponse.data);
        }

        // マッチング結果を取得（最新の選考セッションから）
        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          const latestSession = getLatestCompletedSession(sessionsResponse.data);
          if (latestSession) {
            const resultsResponse = await fetchData<ExamResult[]>(`/schools/${schoolId}/results?session_id=${latestSession.id}`);
            if (resultsResponse.success && resultsResponse.data) {
              setMatchResults(resultsResponse.data);
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

    fetchSchoolData();
  }, [schoolId]);

  // 第一希望者数を計算
  const firstChoiceCount = applications.filter(app => app.preference_order === 1).length;

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card px-6 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">高校詳細</h1>
        <p className="mt-2 text-slate-600">応募状況とマッチング結果を確認し、学校情報を管理します。</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>高校情報</CardTitle>
          <CardDescription>高校の基本情報</CardDescription>
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
          ) : school ? (
            isEditing ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!editForm) return;

                try {
                  const response = await fetch(`/api/schools/${schoolId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editForm),
                  });

                  const result = await response.json();

                  if (result.success) {
                    setSchool(result.data);
                    setIsEditing(false);
                  } else {
                    setError(toUiErrorMessage(result.message, '更新に失敗しました'));
                  }
                } catch (err) {
                  setError(toUiErrorMessage(err instanceof Error ? err.message : undefined, '更新中にエラーが発生しました'));
                  console.error(err);
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">高校名</h3>
                    <input
                      type="text"
                      value={editForm?.name || ''}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">所在地</h3>
                    <input
                      type="text"
                      value={editForm?.location || ''}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, location: e.target.value} : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">定員</h3>
                    <input
                      type="number"
                      value={editForm?.capacity || 0}
                      onChange={(e) => setEditForm(prev => prev ? {...prev, capacity: Number(e.target.value)} : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit" variant="default">保存</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}>キャンセル</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">高校名</h3>
                  <p className="mt-1">{school.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">所在地</h3>
                  <p className="mt-1">{school.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">定員</h3>
                  <p className="mt-1">{school.capacity}名</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
                  <p className="mt-1">応募受付中</p>
                </div>
              </div>
            )
          ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-slate-600">高校情報がありません</p>
              </div>
          )}
        </CardContent>
        <CardFooter>
          {!isEditing && school && (
            <Button
              variant="outline"
              onClick={() => {
                setEditForm({
                  name: school.name,
                  location: school.location ?? '',
                  capacity: school.capacity
                });
                setIsEditing(true);
              }}
            >
              情報を編集
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>応募状況</CardTitle>
          <CardDescription>この高校への応募状況</CardDescription>
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
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">応募情報がありません</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                  <p className="text-sm text-slate-600">応募者数</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{school?.capacity || '-'}</p>
                  <p className="text-sm text-slate-600">定員</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
                  <p className="text-3xl font-bold text-teal-700">{firstChoiceCount}</p>
                  <p className="text-sm text-slate-600">第一希望者数</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>学生ID</TableHead>
                    <TableHead>希望順位</TableHead>
                    <TableHead>成績</TableHead>
                    <TableHead>マッチング結果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    // 対応する試験結果を検索
                    const result = matchResults.find(r => r.student_id === app.student_id);

                    return (
                      <TableRow key={app.id}>
                        <TableCell>{app.student_id}</TableCell>
                        <TableCell>{app.preference_order}</TableCell>
                        <TableCell>{result ? `${result.score}点` : '未公開'}</TableCell>
                        <TableCell>
                          {result ? (
                            result.matched_school_id === schoolId ? (
                              <span className="status-chip status-chip-success">合格</span>
                            ) : (
                              <span className="status-chip status-chip-danger">不合格</span>
                            )
                          ) : '未決定'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
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
          ) : matchResults.length > 0 ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-blue-900">マッチング結果</h3>
              <p className="mb-2 text-blue-700">
                合格者数: {matchResults.filter(r => r.matched_school_id === schoolId).length} / {school?.capacity || '-'}
              </p>
              <p className="text-blue-700">
                平均点: {matchResults.filter(r => r.matched_school_id === schoolId).reduce((sum, r) => sum + r.score, 0) /
                  (matchResults.filter(r => r.matched_school_id === schoolId).length || 1)}点
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="mb-2 text-slate-600">マッチング結果はまだ公開されていません</p>
              <p className="text-sm text-slate-500">結果は選考セッション終了後に公開されます</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
