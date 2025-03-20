import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { School } from '@/lib/types';
import Link from 'next/link';

interface SchoolsListProps {
  schools: School[];
  loading: boolean;
  error: string | null;
}

/**
 * 高校一覧コンポーネント
 */
const SchoolsList: React.FC<SchoolsListProps> = ({ schools, loading, error }) => {
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

  if (schools.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">高校情報がありません</p>
      </div>
    );
  }

  return (
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
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell>{school.id}</TableCell>
            <TableCell>{school.name}</TableCell>
            <TableCell>{school.location}</TableCell>
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
  );
};

export default SchoolsList;
