'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useMe } from '@/features/auth/hooks';

/**
 * 인증 가드 컴포넌트
 *
 * GET /auth/me 로 세션 쿠키 유효성을 검증한 뒤,
 * 비로그인 상태면 /login 으로 리다이렉트합니다.
 * 호스트 전용 페이지에 감싸서 사용하세요.
 *
 * 세션 복원 검증이 끝나기 전에는 리다이렉트하지 않으므로,
 * 새로고침 후에도 유효한 쿠키 세션이 인식됩니다.
 *
 * @example
 * export default function DashboardPage() {
 *   return (
 *     <AuthGuard>
 *       <PageContent />
 *     </AuthGuard>
 *   );
 * }
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isPending } = useMe();

  useEffect(() => {
    // 세션 복원 검증이 끝난 뒤에만 리다이렉트 판단
    if (!isPending && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isPending, isAuthenticated, router]);

  // 검증 중에는 화면을 그리지 않음 (유효한 쿠키 세션 인식 대기)
  if (isPending || !isAuthenticated) return null;

  return <>{children}</>;
}
