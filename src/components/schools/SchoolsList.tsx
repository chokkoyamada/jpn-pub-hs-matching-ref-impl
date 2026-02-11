import React from 'react';
import { useMemo, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { School } from '@/lib/types';
import Link from 'next/link';
import StatePanel from '@/components/ui/StatePanel';

interface SchoolsListProps {
  schools: School[];
  loading: boolean;
  error: string | null;
}

/**
 * 高校一覧コンポーネント
 */
const SchoolsList: React.FC<SchoolsListProps> = ({ schools, loading, error }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'capacity'>('id');

  const filteredSchools = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const base = normalized.length === 0
      ? schools
      : schools.filter((school) => {
          return school.name.toLowerCase().includes(normalized)
            || String(school.id).includes(normalized)
            || (school.location ?? '').toLowerCase().includes(normalized);
        });

    return [...base].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ja');
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return a.id - b.id;
    });
  }, [schools, search, sortBy]);

  if (loading) {
    return <StatePanel message="読み込み中..." />;
  }

  if (error) {
    return <StatePanel message={error} tone="error" />;
  }

  if (schools.length === 0) {
    return <StatePanel message="高校情報がありません" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="高校名・所在地・IDで検索"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm md:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="schools-sort" className="text-sm font-medium text-slate-700">
            並び順
          </label>
          <select
            id="schools-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'id' | 'name' | 'capacity')}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="id">ID順</option>
            <option value="name">名前順</option>
            <option value="capacity">定員順</option>
          </select>
        </div>
      </div>

      {filteredSchools.length === 0 ? (
        <StatePanel message="検索条件に一致する高校がありません" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>高校名</TableHead>
              <TableHead>所在地</TableHead>
              <TableHead>定員</TableHead>
              <TableHead>詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>{school.id}</TableCell>
                <TableCell>{school.name}</TableCell>
                <TableCell>{school.location ?? '-'}</TableCell>
                <TableCell>{school.capacity}</TableCell>
                <TableCell>
                  <Link href={`/schools/${school.id}`}>
                    <Button variant="outline" size="sm">詳細</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SchoolsList;
