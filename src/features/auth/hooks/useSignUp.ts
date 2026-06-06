'use client';

import { useMutation } from '@tanstack/react-query';
import { signUp } from '../api';
import { useAuthStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SignUpRequest } from '@/shared/types/api';

/**
 * 회원가입 뮤테이션
 *
 * 성공 시 서버가 세션 쿠키를 발급하고, auth store 에 사용자 정보를 저장합니다.
 *
 * @example
 * const { mutate, isPending } = useSignUp();
 * mutate({ email, password, nickname });
 */
export function useSignUp() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (request: SignUpRequest) => signUp(request),
    onSuccess: (user) => {
      setUser(user);
    },
    onError: (error) => {
      console.error('[회원가입 실패]', getApiErrorMessage(error));
    },
  });
}
