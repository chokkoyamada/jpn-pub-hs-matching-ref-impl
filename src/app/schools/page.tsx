'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { fetchData } from '@/lib/api';
import { School } from '@/lib/types';
import SchoolsList from '@/components/schools/SchoolsList';

/**
 * 高校一覧ページコンポーネント
 */
export default function SchoolsPage() {
  // 状態管理
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const fetchSchoolsData = async () => {
      setLoading(true);
      try {
        // 高校一覧を取得
        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolsData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">高校一覧</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>高校一覧</CardTitle>
          <CardDescription>システムに登録されている高校の一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolsList
            schools={schools}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
