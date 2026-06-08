'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useMe } from '@/features/auth/hooks';

/**
 * 게스트 전용 가드 (AuthGuard 의 반대)
 *
 * GET /auth/me 로 세션을 복원한 뒤, **이미 로그인된** 사용자가
 * /login·/signup 에 접근하면 대시보드로 보냅니다.
 * (로그인한 호스트가 "호스트로 시작"=/login 을 눌러도 로그인 폼이 다시 뜨지 않도록)
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isPending } = useMe();

  useEffect(() => {
    if (!isPending && isAuthenticated) {
      router.replace('/dashboard/quizzes');
    }
  }, [isPending, isAuthenticated, router]);

  // 세션 복원 검증 중이거나 이미 인증된 경우(리다이렉트 대기)에는 폼을 그리지 않음
  if (isPending || isAuthenticated) return null;

  return <>{children}</>;
}
