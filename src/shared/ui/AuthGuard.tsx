'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';

/**
 * 인증 가드 컴포넌트
 *
 * 비로그인 상태면 /login으로 리다이렉트합니다.
 * 호스트 전용 페이지에 감싸서 사용하세요.
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
