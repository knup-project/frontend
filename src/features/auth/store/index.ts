'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenResponse } from '@/shared/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setTokens: (tokens: TokenResponse) => void;
  clearTokens: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  isAuthenticated: false,
};

/**
 * 인증 스토어 (localStorage persist)
 *
 * 스토리지 키: "knup-auth" (shared/api/client.ts 의 TOKEN_STORAGE_KEY 와 동일)
 *
 * 보안 참고:
 *   localStorage 는 XSS 공격에 취약합니다.
 *   프로덕션에서는 httpOnly cookie 기반 저장을 권장합니다.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTokens: (tokens: TokenResponse) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          isAuthenticated: true,
        }),

      clearTokens: () => {
        set(initialState);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('knup-auth');
        }
      },
    }),
    {
      name: 'knup-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
