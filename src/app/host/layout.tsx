import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * 호스트 레이아웃 — 인증 보호
 *
 * localStorage 기반 토큰은 서버에서 직접 읽을 수 없으므로
 * 클라이언트 미들웨어 패턴으로 처리합니다.
 * (실제 프로덕션에서는 httpOnly cookie로 전환 권장)
 */
export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 호스트 공통 레이아웃 — 네비게이션은 클라이언트 컴포넌트에서 처리 */}
      {children}
    </div>
  );
}
