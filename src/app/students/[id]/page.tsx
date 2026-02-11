'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { fetchData } from '@/lib/api';
import { School, Application, ExamResult, SelectionSession } from '@/lib/types';
import ApplicationForm from '@/components/students/ApplicationForm';

import { use } from 'react';

/**
 * 学生詳細ページコンポーネント
 * 学生が高校への応募情報を管理するページ
 */
export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // URLパスからIDを取得
  const resolvedParams = use(params);
  const studentId = Number(resolvedParams.id);

  // 状態管理
  const [applications, setApplications] = useState<Application[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // データ取得
  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // 応募情報を取得
        const applicationsResponse = await fetchData<Application[]>(`/students/${studentId}/applications`);
        if (applicationsResponse.success && applicationsResponse.data) {
          setApplications(applicationsResponse.data);
        }

        // 高校一覧を取得
        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }

        // マッチング結果を取得（最新の選考セッションから）
        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          const completedSessions = sessionsResponse.data.filter((session) => session.status === 'completed');
          if (completedSessions.length > 0) {
            const latestSession = completedSessions[completedSessions.length - 1];
            const resultsResponse = await fetchData<ExamResult[]>(`/students/${studentId}/results?session_id=${latestSession.id}`);
            if (resultsResponse.success && resultsResponse.data && resultsResponse.data.length > 0) {
              setExamResult(resultsResponse.data[0]);
            }
          }
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  // 応募情報の更新後に再取得
  const handleApplicationSuccess = async () => {
    setShowApplicationForm(false);

    // 応募情報を再取得
    try {
      const response = await fetchData<Application[]>(`/students/${studentId}/applications`);
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err) {
      console.error('応募情報の再取得に失敗しました:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card px-6 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">学生詳細</h1>
        <p className="mt-2 text-slate-600">応募状況とマッチング結果を確認し、希望校を編集できます。</p>
      </section>

      {showApplicationForm ? (
        <ApplicationForm
          studentId={studentId}
          onSuccess={handleApplicationSuccess}
        />
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
                    const school = schools.find(s => s.id === app.school_id);
                    return (
                      <TableRow key={app.id}>
                        <TableCell>{app.preference_order}</TableCell>
                        <TableCell>{app.school_name || (school ? school.name : '-')}</TableCell>
                        <TableCell>{app.school_location || (school ? school.location : '-')}</TableCell>
                        <TableCell>{school ? school.capacity : '-'}</TableCell>
                        <TableCell><span className="status-chip status-chip-success">応募済み</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowApplicationForm(true)}>
              応募情報を編集
            </Button>
          </CardFooter>
        </Card>
      )}

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
                  <>
                    合格: {examResult.school_name || schools.find(s => s.id === examResult.matched_school_id)?.name || '不明な高校'}
                  </>
                ) : (
                  <>不合格</>
                )}
              </h3>
              <p className="text-blue-700">
                あなたの成績: {examResult.score}点
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
