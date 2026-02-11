import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * レイアウトコンポーネントのプロパティ
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * レイアウトコンポーネント
 * アプリケーションの基本レイアウトを提供
 * ヘッダー、メインコンテンツ、フッターを含む
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto w-full flex-grow px-4 pb-10 pt-24 md:px-6 md:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
