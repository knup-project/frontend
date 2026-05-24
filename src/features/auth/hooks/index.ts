'use client';

import { useMutation } from '@tanstack/react-query';
import { login, signUp } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { LoginRequest, SignUpRequest } from '@/shared/types/api';

/**
 * 회원가입 뮤테이션
 *
 * 성공 시 auth store 에 토큰 자동 저장
 *
 * @example
 * const { mutate, isPending } = useSignUp();
 * mutate({ email, password, nickname });
 */
export function useSignUp() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (request: SignUpRequest) => signUp(request),
    onSuccess: (tokens) => {
      setTokens(tokens);
      // 필요 시 router.push('/dashboard/quizzes') 호출
    },
    onError: (error) => {
      console.error('[회원가입 실패]', getApiErrorMessage(error));
    },
  });
}

/**
 * 로그인 뮤테이션
 *
 * 성공 시 auth store 에 토큰 자동 저장
 *
 * @example
 * const { mutate, isPending } = useLogin();
 * mutate({ email, password });
 */
export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (tokens) => {
      setTokens(tokens);
      // 필요 시 router.push('/dashboard/quizzes') 호출
    },
    onError: (error) => {
      console.error('[로그인 실패]', getApiErrorMessage(error));
    },
  });
}

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
    // 필요 시 router.push('/login') 호출
  };

  return { logout };
}
