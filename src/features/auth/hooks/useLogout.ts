'use client';

import { useAuthStore } from '../store';

/**
 * 로그아웃
 *
 * store + localStorage 동시 정리
 *
 * @example
 * const { logout } = useLogout();
 * logout();
 */
export function useLogout() {
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const logout = () => {
    clearTokens();
  };

  return { logout };
}
