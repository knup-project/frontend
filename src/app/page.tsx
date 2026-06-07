import Link from 'next/link';

/**
 * 랜딩 페이지
 *
 * 로그인한 사용자 → /dashboard/quizzes
 * 비로그인 참가자 → /join
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 p-8 min-h-screen">
      {/* 로고 */}
      <div className="text-center">
        <div
          aria-hidden
          className="inline-flex items-center justify-center mb-5"
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            background: 'var(--color-primary)',
            boxShadow: 'var(--glow-red)',
            fontSize: 44,
          }}
        >
          🎮
        </div>
        <h1 className="text-5xl font-extrabold mb-3" style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
          크누피
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
          경북대 실시간 퀴즈 — 강의실을 깨우다
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/join"
          className="btn-primary text-center no-underline flex items-center justify-center"
        >
          퀴즈 참가하기
        </Link>
        <Link
          href="/login"
          className="btn-secondary text-center no-underline flex items-center justify-center"
        >
          호스트 로그인
        </Link>
      </div>
    </main>
  );
}
