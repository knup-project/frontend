'use client';

import { useMutation } from '@tanstack/react-query';
import { createSession } from '../api';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SessionCreateRequest } from '@/shared/types/api';

/**
 * 세션 생성 뮤테이션
 *
 * @example
 * const { mutate } = useCreateSession();
 * mutate({ quizId: 1 });
 */
export function useCreateSession() {
  return useMutation({
    mutationFn: (request: SessionCreateRequest) => createSession(request),
    onError: (error) => {
      console.error('[세션 생성 실패]', getApiErrorMessage(error));
    },
  });
}
