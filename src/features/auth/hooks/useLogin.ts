'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { LoginRequest } from '@/shared/types/api';

/**
 * 로그인 뮤테이션
 *
 * 성공 시 서버가 세션 쿠키를 발급하고, auth store 에 사용자 정보를 저장합니다.
 *
 * @example
 * const { mutate, isPending } = useLogin();
 * mutate({ email, password });
 */
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (user) => {
      setUser(user);
    },
    onError: (error) => {
      console.error('[로그인 실패]', getApiErrorMessage(error));
    },
  });
}
