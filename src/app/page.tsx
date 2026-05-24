import Link from 'next/link';

/**
 * 랜딩 페이지
 *
 * 로그인한 사용자 → /dashboard/quizzes
 * 비로그인 참가자 → /join
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8 min-h-screen">
      {/* 로고 */}
      <div className="text-center">
        <h1
          style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.43', color: '#222222' }}
          className="mb-3"
        >
          KNU-P
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#6a6a6a' }}>
          실시간 퀴즈 플랫폼
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
