import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import Link from 'next/link';

/**
 * 教育委員会向けページコンポーネント
 * 教育委員会が選考セッションを管理し、マッチングを実行するページ
 */
export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">教育委員会向けページ</h1>
        <Button>ログイン</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>選考セッション</CardTitle>
          <CardDescription>マッチングの選考セッション管理</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-blue-600">2</p>
              <p className="text-sm text-gray-500">セッション数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-green-600">1</p>
              <p className="text-sm text-gray-500">完了セッション</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-3xl font-bold text-yellow-600">1</p>
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
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>2025-03-20 09:14:13</TableCell>
                <TableCell>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    完了
                  </span>
                </TableCell>
                <TableCell>1</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">詳細</Button>
                    <Button variant="ghost" size="sm">削除</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>2025-03-20 09:14:13</TableCell>
                <TableCell>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    保留中
                  </span>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm">実行</Button>
                    <Button variant="outline" size="sm">詳細</Button>
                    <Button variant="ghost" size="sm">削除</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button>新規セッション作成</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>高校管理</CardTitle>
          <CardDescription>システムに登録されている高校の管理</CardDescription>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>第一高校</TableCell>
                <TableCell>東京都千代田区</TableCell>
                <TableCell>3</TableCell>
                <TableCell>5</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">編集</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>第二高校</TableCell>
                <TableCell>東京都新宿区</TableCell>
                <TableCell>2</TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">編集</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>第三高校</TableCell>
                <TableCell>東京都渋谷区</TableCell>
                <TableCell>4</TableCell>
                <TableCell>4</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">編集</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>第四高校</TableCell>
                <TableCell>東京都中野区</TableCell>
                <TableCell>3</TableCell>
                <TableCell>2</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">編集</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>第五高校</TableCell>
                <TableCell>東京都杉並区</TableCell>
                <TableCell>2</TableCell>
                <TableCell>1</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">編集</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button>高校を追加</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学生管理</CardTitle>
          <CardDescription>システムに登録されている学生の管理</CardDescription>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>山田太郎</TableCell>
                <TableCell>3</TableCell>
                <TableCell>第一高校</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>佐藤花子</TableCell>
                <TableCell>2</TableCell>
                <TableCell>未決定</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>鈴木一郎</TableCell>
                <TableCell>4</TableCell>
                <TableCell>未決定</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">詳細</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button>学生を追加</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
