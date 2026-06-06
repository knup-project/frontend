'use client';

import { useRouter } from 'next/navigation';
import { logout as logoutRequest } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';

/**
 * 로그아웃
 *
 * 서버 세션을 무효화한 뒤 store 를 비우고 /login 으로 이동합니다.
 * 서버 요청이 실패하더라도 클라이언트 상태는 정리합니다.
 *
 * @example
 * const { logout } = useLogout();
 * logout();
 */
export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('[로그아웃 실패]', getApiErrorMessage(error));
    } finally {
      clear();
      router.replace('/login');
    }
  };

  return { logout };
}
