import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import Link from 'next/link';

/**
 * 高校向けページコンポーネント
 * 高校が応募状況やマッチング結果を確認するページ
 */
export default function SchoolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">高校向けページ</h1>
        <Button>ログイン</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>高校情報</CardTitle>
          <CardDescription>あなたの高校の基本情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">高校名</h3>
              <p className="mt-1">第一高校</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">所在地</h3>
              <p className="mt-1">東京都千代田区</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">定員</h3>
              <p className="mt-1">3名</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
              <p className="mt-1">応募受付中</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">情報を編集</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>応募状況</CardTitle>
          <CardDescription>あなたの高校への応募状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-blue-600">5</p>
              <p className="text-sm text-gray-500">応募者数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-green-600">3</p>
              <p className="text-sm text-gray-500">定員</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-purple-600">2</p>
              <p className="text-sm text-gray-500">第一希望者数</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生ID</TableHead>
                <TableHead>希望順位</TableHead>
                <TableHead>成績</TableHead>
                <TableHead>マッチング結果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>1</TableCell>
                <TableCell>未公開</TableCell>
                <TableCell>未決定</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>2</TableCell>
                <TableCell>未公開</TableCell>
                <TableCell>未決定</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>1</TableCell>
                <TableCell>未公開</TableCell>
                <TableCell>未決定</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>3</TableCell>
                <TableCell>未公開</TableCell>
                <TableCell>未決定</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>9</TableCell>
                <TableCell>2</TableCell>
                <TableCell>未公開</TableCell>
                <TableCell>未決定</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>マッチング結果</CardTitle>
          <CardDescription>マッチングアルゴリズムによる結果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">マッチング結果はまだ公開されていません</p>
            <p className="text-sm text-gray-400">結果は選考セッション終了後に公開されます</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
