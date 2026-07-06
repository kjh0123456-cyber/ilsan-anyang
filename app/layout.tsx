import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "일산안양 | 프리미엄 스마트홈 가전",
  description: "가까운 일상, 스마트한 선택. 일산안양 공식 스토어",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
