import React from 'react';
import Link from 'next/link';

/**
 * ヘッダーコンポーネント
 * アプリケーションの上部に表示されるナビゲーションバー
 */
const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold hover:text-blue-100">
              公立高校マッチングシステム
            </Link>
          </div>

          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/students" className="hover:text-blue-100">
                  学生
                </Link>
              </li>
              <li>
                <Link href="/schools" className="hover:text-blue-100">
                  高校
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-100">
                  教育委員会
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
