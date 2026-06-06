'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@/shared/types/api';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: AuthResponse) => void;
  clear: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

/**
 * 인증 스토어 (localStorage persist)
 *
 * 스토리지 키: "knup-auth"
 *
 * 세션 쿠키(JSESSIONID, httpOnly)는 브라우저가 관리하므로 토큰을 저장하지 않습니다.
 * 여기에는 로그인 사용자 정보와 인증 여부만 보관하며,
 * 앱 로드 시 GET /auth/me 로 실제 세션 유효성을 검증합니다.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user: AuthResponse) =>
        set({
          user,
          isAuthenticated: true,
        }),

      clear: () => {
        set(initialState);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('knup-auth');
        }
      },
    }),
    {
      name: 'knup-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
