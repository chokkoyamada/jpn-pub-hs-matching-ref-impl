import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Student, ExamResult, School } from '@/lib/types';
import Link from 'next/link';

interface StudentsListProps {
  students: Student[];
  examResults?: ExamResult[];
  schools?: School[];
  loading: boolean;
  error: string | null;
}

/**
 * 学生一覧コンポーネント
 */
const StudentsList: React.FC<StudentsListProps> = ({ students, examResults = [], schools = [], loading, error }) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">学生情報がありません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>マッチング結果</TableHead>
          <TableHead>詳細</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => {
          // この学生のマッチング結果を検索
          const result = examResults.find(r => r.student_id === student.id);
          const matchedSchool = result && result.matched_school_id
            ? schools.find(s => s.id === result.matched_school_id)
            : null;

          return (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
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
        })}
      </TableBody>
    </Table>
  );
};

export default StudentsList;
