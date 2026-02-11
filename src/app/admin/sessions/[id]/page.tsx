'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { fetchData } from '@/lib/api';
import { toUiErrorMessage } from '@/lib/client-utils';
import { SelectionSession, ExamResult, School, Student } from '@/lib/types';
import { use } from 'react';

/**
 * 選考セッション詳細ページコンポーネント
 * 選考セッションの詳細情報とマッチング結果を表示する
 */
export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // URLパスからIDを取得
  const resolvedParams = use(params);
  const sessionId = Number(resolvedParams.id);

  // 状態管理
  const [session, setSession] = useState<SelectionSession | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        // セッション情報を取得
        const sessionResponse = await fetchData<{ session: SelectionSession & {
          summary: { total_students: number; matched_students: number; average_score: number };
          schools: Array<{ id: number; name: string; capacity: number; matched_count: number }>;
        }}>(`/admin/sessions/${sessionId}`);
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data.session);
        }

        // マッチング結果を取得
        const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${sessionId}/results`);
        if (resultsResponse.success && resultsResponse.data) {
          setExamResults(resultsResponse.data);
        }

        // 高校一覧を取得
        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }

        // 学生一覧を取得
        const studentsResponse = await fetchData<Student[]>('/students');
        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data);
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

  // マッチング済み学生数
  const matchedStudentsCount = examResults.filter(result => result.matched_school_id !== null).length;

  // 平均スコア
  const averageScore = examResults.length > 0
    ? examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length
    : 0;

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <span className="status-chip status-chip-success">
                        完了
                      </span>
                    ) : (
                      <span className="status-chip status-chip-warning">
                        保留中
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">マッチング数</h3>
                  <p className="mt-1">{matchedStudentsCount} / {students.length}</p>
                </div>
              </div>

              {session.status === 'completed' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <h3 className="font-medium text-blue-800">マッチング率</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {((matchedStudentsCount / students.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">平均スコア</h3>
                    <p className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}点</p>
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
                  <TableHead>結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examResults.map((result) => {
                  const student = students.find(s => s.id === result.student_id);
                  const matchedSchool = schools.find(s => s.id === result.matched_school_id);

                  return (
                    <TableRow key={result.id}>
                      <TableCell>{student?.name || `ID: ${result.student_id}`}</TableCell>
                      <TableCell>{result.score}点</TableCell>
                      <TableCell>
                        {matchedSchool ? matchedSchool.name : '未マッチング'}
                      </TableCell>
                      <TableCell>
                        {matchedSchool ? (
                          <span className="status-chip status-chip-success">
                            合格
                          </span>
                        ) : (
                          <span className="status-chip status-chip-danger">
                            不合格
                          </span>
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
