import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "公立高校マッチングシステム",
  description: "日本の公立高校入試制度の併願制とDAアルゴリズムによるマッチングの参考実装",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
