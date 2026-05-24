'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nextQuestion } from '../api';
import { sessionKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';

/**
 * 다음 문제로 이동 뮤테이션
 *
 * 성공 시 해당 세션 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useNextQuestion();
 * mutate(sessionId);
 */
export function useNextQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => nextQuestion(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[다음 문제 이동 실패]', getApiErrorMessage(error));
    },
  });
}
