'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { LoginRequest } from '@/shared/types/api';

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
    },
    onError: (error) => {
      console.error('[로그인 실패]', getApiErrorMessage(error));
    },
  });
}
