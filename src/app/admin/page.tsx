'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import Link from 'next/link';
import { fetchData, postData } from '@/lib/api';
import { School, Student, SelectionSession, ExamResult } from '@/lib/types';

/**
 * 教育委員会向けページコンポーネント
 * 教育委員会が選考セッションを管理し、マッチングを実行するページ
 */
export default function AdminPage() {
  // 状態管理
  const [sessions, setSessions] = useState<SelectionSession[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningSession, setRunningSession] = useState<number | null>(null);

  // 応募情報の状態
  const [applications, setApplications] = useState<Array<{
    id: number;
    student_id: number;
    school_id: number;
    preference_order: number;
  }>>([]);

  // データ取得
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // 選考セッション一覧を取得
        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          setSessions(sessionsResponse.data);
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

        // 応募情報を取得
        const applicationsResponse = await fetchData<Array<{
          id: number;
          student_id: number;
          school_id: number;
          preference_order: number;
          student_name?: string;
          school_name?: string;
        }>>('/applications');
        if (applicationsResponse.success && applicationsResponse.data) {
          setApplications(applicationsResponse.data);
        }

        // 最新の選考セッションの結果を取得
        const completedSessions = sessionsResponse.success && sessionsResponse.data
          ? sessionsResponse.data.filter(session => session.status === 'completed')
          : [];

        if (completedSessions.length > 0) {
          // 最新のセッションを取得（作成日時でソート）
          const sortedSessions = [...completedSessions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latestSession = sortedSessions[0];

          console.log('Admin - Latest session:', latestSession);

          const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${latestSession.id}/results`);
          if (resultsResponse.success && resultsResponse.data) {
            console.log('Admin - Exam results:', resultsResponse.data);
            setExamResults(resultsResponse.data);
          }
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // 選考セッションを実行
  const runSession = async (sessionId: number) => {
    setRunningSession(sessionId);
    try {
      const response = await postData(`/admin/sessions/${sessionId}/run`, {});
      if (response.success) {
        // セッション一覧を再取得
        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          setSessions(sessionsResponse.data);
        }

        // 結果を取得
        const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${sessionId}/results`);
        if (resultsResponse.success && resultsResponse.data) {
          setExamResults(resultsResponse.data);
        }
      } else {
        setError('選考セッションの実行に失敗しました');
      }
    } catch (err) {
      setError('選考セッションの実行中にエラーが発生しました');
      console.error(err);
    } finally {
      setRunningSession(null);
    }
  };

  // 新規セッション作成
  const createSession = async () => {
    try {
      const response = await postData('/admin/sessions', {});
      if (response.success && response.data) {
        // セッション一覧を再取得
        const sessionsResponse = await fetchData<SelectionSession[]>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          setSessions(sessionsResponse.data);
        }
      } else {
        setError('新規セッションの作成に失敗しました');
      }
    } catch (err) {
      setError('新規セッションの作成中にエラーが発生しました');
      console.error(err);
    }
  };

  // 完了セッション数
  const completedSessionsCount = sessions.filter(session => session.status === 'completed').length;

  // 保留中セッション数
  const pendingSessionsCount = sessions.filter(session => session.status === 'pending').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">教育委員会向けページ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>選考セッション</CardTitle>
          <CardDescription>マッチングの選考セッション管理</CardDescription>
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
            <>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg flex-1 text-center">
                  <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
                  <p className="text-sm text-gray-500">セッション数</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg flex-1 text-center">
                  <p className="text-3xl font-bold text-green-600">{completedSessionsCount}</p>
                  <p className="text-sm text-gray-500">完了セッション</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg flex-1 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{pendingSessionsCount}</p>
                  <p className="text-sm text-gray-500">保留中セッション</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>作成日時</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>マッチング数</TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        セッションがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map(session => {
                      // このセッションのマッチング数を取得
                      const matchCount = session.status === 'completed' && session.summary
                        ? session.summary.matched_students
                        : null;

                      return (
                        <TableRow key={session.id}>
                          <TableCell>{session.id}</TableCell>
                          <TableCell>{new Date(session.created_at).toLocaleString('ja-JP')}</TableCell>
                          <TableCell>
                            {session.status === 'completed' ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                完了
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                保留中
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{matchCount !== null ? matchCount : '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {session.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => runSession(session.id)}
                                  disabled={runningSession !== null}
                                >
                                  {runningSession === session.id ? '実行中...' : '実行'}
                                </Button>
                              )}
                              <Link href={`/admin/sessions/${session.id}`}>
                                <Button variant="outline" size="sm">詳細</Button>
                              </Link>
                              <Button variant="ghost" size="sm">削除</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createSession} disabled={loading}>新規セッション作成</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>高校管理</CardTitle>
          <CardDescription>システムに登録されている高校の管理</CardDescription>
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
                  <TableHead>ID</TableHead>
                  <TableHead>高校名</TableHead>
                  <TableHead>所在地</TableHead>
                  <TableHead>定員</TableHead>
                  <TableHead>応募者数</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      高校がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map(school => (
                    <TableRow key={school.id}>
                      <TableCell>{school.id}</TableCell>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.location}</TableCell>
                      <TableCell>{school.capacity}</TableCell>
                      <TableCell>
                        {applications.filter(app => app.school_id === school.id).length}
                      </TableCell>
                      <TableCell>
                        <Link href={`/schools/${school.id}`}>
                          <Button variant="outline" size="sm">詳細</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={loading}>高校を追加</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学生管理</CardTitle>
          <CardDescription>システムに登録されている学生の管理</CardDescription>
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
                  <TableHead>ID</TableHead>
                  <TableHead>名前</TableHead>
                  <TableHead>応募数</TableHead>
                  <TableHead>マッチング結果</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      学生がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map(student => {
                    // この学生のマッチング結果を検索
                    const result = examResults.find(r => r.student_id === student.id);
                    const matchedSchool = result && result.matched_school_id
                      ? schools.find(s => s.id === result.matched_school_id)
                      : null;

                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{applications.filter(app => app.student_id === student.id).length}</TableCell>
                        <TableCell>
                          {matchedSchool ? matchedSchool.name : '未決定'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/students/${student.id}`}>
                            <Button variant="outline" size="sm">詳細</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={loading}>学生を追加</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
