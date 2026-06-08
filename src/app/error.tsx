'use client';

import Link from 'next/link';
import { Knupy } from '@/shared/ui/Knupy';

/**
 * 전역 에러 바운더리 — Next 기본 "This page couldn't load" 대신 크누피 톤으로 처리.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen gap-5 p-8 text-center">
      <Knupy mood="sad" size={110} />
      <h1 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
        앗, 잠깐 문제가 생겼어요
      </h1>
      <p style={{ color: 'var(--color-muted)' }}>잠시 후 다시 시도하거나 홈으로 돌아가 주세요.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          다시 시도
        </button>
        <Link href="/" className="btn-secondary no-underline flex items-center justify-center">
          홈으로
        </Link>
      </div>
    </main>
  );
}
