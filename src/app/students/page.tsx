'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchData } from '@/lib/api';
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
        const sessionsResponse = await fetchData<any>('/admin/sessions');
        if (sessionsResponse.success && sessionsResponse.data) {
          const completedSessions = sessionsResponse.data.filter((session: any) => session.status === 'completed');
          if (completedSessions.length > 0) {
            const latestSession = completedSessions[completedSessions.length - 1];
            const resultsResponse = await fetchData<ExamResult[]>(`/admin/sessions/${latestSession.id}/results`);
            if (resultsResponse.success && resultsResponse.data) {
              setExamResults(resultsResponse.data);
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

    fetchStudentsData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">学生一覧</h1>
      </div>

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
