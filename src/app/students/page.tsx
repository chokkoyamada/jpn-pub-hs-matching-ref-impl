import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import Link from 'next/link';

/**
 * 学生向けページコンポーネント
 * 学生が高校への応募情報を管理するページ
 */
export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">学生向けページ</h1>
        <Button>ログイン</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>応募状況</CardTitle>
          <CardDescription>あなたの高校への応募状況です</CardDescription>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>第一高校</TableCell>
                <TableCell>東京都千代田区</TableCell>
                <TableCell>3</TableCell>
                <TableCell>応募済み</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>第二高校</TableCell>
                <TableCell>東京都新宿区</TableCell>
                <TableCell>2</TableCell>
                <TableCell>応募済み</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>第三高校</TableCell>
                <TableCell>東京都渋谷区</TableCell>
                <TableCell>4</TableCell>
                <TableCell>応募済み</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button>応募情報を編集</Button>
        </CardFooter>
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

      <Card>
        <CardHeader>
          <CardTitle>高校一覧</CardTitle>
          <CardDescription>応募可能な高校の一覧</CardDescription>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>第一高校</TableCell>
                <TableCell>東京都千代田区</TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>第二高校</TableCell>
                <TableCell>東京都新宿区</TableCell>
                <TableCell>2</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>第三高校</TableCell>
                <TableCell>東京都渋谷区</TableCell>
                <TableCell>4</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>第四高校</TableCell>
                <TableCell>東京都中野区</TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>第五高校</TableCell>
                <TableCell>東京都杉並区</TableCell>
                <TableCell>2</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
