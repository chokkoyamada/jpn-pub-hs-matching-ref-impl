'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { fetchData } from '@/lib/api';
import { getLatestCompletedSession, toUiErrorMessage } from '@/lib/client-utils';
import { Student, ExamResult, School } from '@/lib/types';
import StudentsList from '@/components/students/StudentsList';

/**
 * 学生一覧ページコンポーネント
 */
export default function StudentsPage() {
  // 状態管理
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const fetchStudentsData = async () => {
      setLoading(true);
      try {
        // 学生一覧を取得
        const studentsResponse = await fetchData<Student[]>('/students');
        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data);
        }

        // 高校一覧を取得
        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }

        // マッチング結果を取得（最新の選考セッションから）
        const sessionsResponse = await fetchData<Array<{
          id: number;
          status: 'pending' | 'completed';
          created_at: string;
          summary: {
            total_students: number;
            matched_students: number;
            average_score: number;
          };
        }>>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          const latestSession = getLatestCompletedSession(sessionsResponse.data);
          if (latestSession) {
            const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${latestSession.id}/results`);
            if (resultsResponse.success && resultsResponse.data) {
              setExamResults(resultsResponse.data);
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

    fetchStudentsData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card px-6 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">学生一覧</h1>
        <p className="mt-2 text-slate-600">
          志望登録とマッチング結果の確認対象となる学生を一覧で表示します。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>学生一覧</CardTitle>
          <CardDescription>システムに登録されている学生の一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsList
            students={students}
            examResults={examResults}
            schools={schools}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
