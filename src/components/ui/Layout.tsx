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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
