'use client';

import Link from 'next/link';
import { Knupy } from '@/shared/ui/Knupy';

/**
 * 참가자 라이브(play) 전용 에러 바운더리 — 다크 무대 톤.
 */
export default function PlayError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="stage min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center">
      <Knupy mood="sad" size={110} />
      <h1 className="font-display text-3xl" style={{ color: 'var(--stage-text)' }}>
        연결이 잠깐 끊겼어요
      </h1>
      <p style={{ color: 'var(--stage-muted)' }}>다시 시도하거나 PIN 입장으로 돌아가 주세요.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          다시 시도
        </button>
        <Link
          href="/join"
          className="no-underline inline-flex items-center"
          style={{
            height: 48,
            padding: '0 24px',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--stage-text)',
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 9999,
            border: '1px solid var(--stage-border)',
          }}
        >
          다시 입장
        </Link>
      </div>
    </div>
  );
}
