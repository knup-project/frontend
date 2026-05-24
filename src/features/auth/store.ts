'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenResponse } from '@/shared/types/api';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────────────

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  isAuthenticated: false,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

/**
 * 인증 스토어 (localStorage persist)
 *
 * 보안 참고:
 *   localStorage는 XSS 공격에 취약합니다.
 *   프로덕션에서는 httpOnly cookie 기반 저장을 권장합니다.
 *
 * 스토리지 키: "knup-auth" (shared/api/client.ts의 TOKEN_STORAGE_KEY와 동일)
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
        // persist 미들웨어가 자동으로 localStorage를 정리하지만,
        // 명시적으로 즉시 제거하여 클라이언트 인터셉터와 동기화
        if (typeof window !== 'undefined') {
          localStorage.removeItem('knup-auth');
        }
      },
    }),
    {
      name: 'knup-auth',  // localStorage 키 (client.ts의 TOKEN_STORAGE_KEY와 일치)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
