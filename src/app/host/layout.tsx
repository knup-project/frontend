/**
 * 호스트 레이아웃
 *
 * 인증 보호는 각 페이지의 AuthGuard 클라이언트 컴포넌트에서 처리합니다.
 * (localStorage 토큰 → 서버 컴포넌트에서 직접 접근 불가)
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
