'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endSession } from '../api';
import { sessionKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';

/**
 * 세션 종료 뮤테이션
 *
 * 성공 시 해당 세션 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useEndSession();
 * mutate(sessionId);
 */
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => endSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[세션 종료 실패]', getApiErrorMessage(error));
    },
  });
}
