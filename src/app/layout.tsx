import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/**
 * Airbnb Cereal VF 대체 폰트: Inter
 * design.md 기준 — Cereal/Circular 미사용 시 Inter 가 가장 유사
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KNU-P | 실시간 퀴즈 플랫폼',
  description: '강의실을 위한 실시간 퀴즈 플랫폼 — KNU-P',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
