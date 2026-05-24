'use client';

import { useMutation } from '@tanstack/react-query';
import { signUp } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SignUpRequest } from '@/shared/types/api';

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
    },
    onError: (error) => {
      console.error('[회원가입 실패]', getApiErrorMessage(error));
    },
  });
}
