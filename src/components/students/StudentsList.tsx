import React from 'react';
import { useMemo, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Student, ExamResult, School } from '@/lib/types';
import Link from 'next/link';
import StatePanel from '@/components/ui/StatePanel';

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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');

  const filteredStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const base = normalized.length === 0
      ? students
      : students.filter((student) => {
          return student.name.toLowerCase().includes(normalized) || String(student.id).includes(normalized);
        });

    return [...base].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ja');
      }
      return a.id - b.id;
    });
  }, [search, sortBy, students]);

  if (loading) {
    return (
      <StatePanel message="読み込み中..." />
    );
  }

  if (error) {
    return <StatePanel message={error} tone="error" />;
  }

  if (students.length === 0) {
    return <StatePanel message="学生情報がありません" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="名前またはIDで検索"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="students-sort" className="text-sm font-medium text-slate-700">
            並び順
          </label>
          <select
            id="students-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'id' | 'name')}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="id">ID順</option>
            <option value="name">名前順</option>
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <StatePanel message="検索条件に一致する学生がいません" />
      ) : (
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
            {filteredStudents.map((student) => {
              const result = examResults.find(r => r.student_id === student.id);
              const matchedSchool = result && result.matched_school_id
                ? schools.find(s => s.id === result.matched_school_id)
                : null;

              return (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{matchedSchool ? matchedSchool.name : '未決定'}</TableCell>
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
      )}
    </div>
  );
};

export default StudentsList;
