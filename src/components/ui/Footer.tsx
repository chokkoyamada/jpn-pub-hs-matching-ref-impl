import React from 'react';

/**
 * フッターコンポーネント
 * アプリケーションの下部に表示される情報
 */
const Footer = () => {
  return (
    <footer className="mt-10 border-t border-slate-200/80 bg-white/80 py-6 text-slate-600 backdrop-blur">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">
              &copy; 2025 Naoyuki Yamada(Kirishiki Studios) -{" "}
              <a className="underline decoration-slate-300 underline-offset-4 transition-colors duration-200 hover:text-slate-900" href="https://www.kirishikistudios.com/">
                Kirishiki Studios
              </a>
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              このシステムは、日本の公立高校入試制度の併願制とDAアルゴリズムによるマッチングの参考実装です。
            </p>
            <p>
              GitHub:{" "}
              <a
                className="underline decoration-slate-300 underline-offset-4 transition-colors duration-200 hover:text-slate-900"
                href="https://github.com/chokkoyamada/jpn-pub-hs-matching-ref-impl"
              >
                https://github.com/chokkoyamada/jpn-pub-hs-matching-ref-impl
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
