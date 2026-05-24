'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startSession } from '../api';
import { sessionKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';

/**
 * 세션 시작 뮤테이션
 *
 * 성공 시 해당 세션 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useStartSession();
 * mutate(sessionId);
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => startSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[세션 시작 실패]', getApiErrorMessage(error));
    },
  });
}
