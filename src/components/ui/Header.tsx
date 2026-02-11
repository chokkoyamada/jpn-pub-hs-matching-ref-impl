import React from 'react';
import Link from 'next/link';

/**
 * ヘッダーコンポーネント
 * アプリケーションの上部に表示されるナビゲーションバー
 */
const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="container mx-auto px-4 pt-4 md:px-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/92 px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur md:px-5">
          <div className="flex items-center">
            <Link href="/" className="text-base font-bold text-slate-900 transition-colors duration-200 hover:text-blue-700 md:text-lg">
              公立高校マッチングシステム
            </Link>
          </div>

          <nav>
            <ul className="flex items-center gap-1 md:gap-2">
              <li>
                <Link
                  href="/students"
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 md:px-3"
                >
                  学生
                </Link>
              </li>
              <li>
                <Link
                  href="/schools"
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 md:px-3"
                >
                  高校
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="cursor-pointer rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 hover:text-white focus-visible:text-white visited:text-white md:px-3"
                >
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
