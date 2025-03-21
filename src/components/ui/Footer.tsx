import React from 'react';

/**
 * フッターコンポーネント
 * アプリケーションの下部に表示される情報
 */
const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              &copy; 2025 Naoyuki Yamada(Kirishiki Studios) - <a href="https://www.kirishikistudios.com/">Kirishiki Studios</a>
            </p>
          </div>
          <div className="text-sm">
            <p>
              このシステムは、日本の公立高校入試制度の併願制とDAアルゴリズムによるマッチングの参考実装です。
            </p>
            <p>
              GitHub: <a href="https://github.com/chokkoyamada/jpn-pub-hs-matching-ref-impl">https://github.com/chokkoyamada/jpn-pub-hs-matching-ref-impl</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
