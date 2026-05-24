'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteQuiz } from '../api';
import { quizKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';

/**
 * 퀴즈 삭제 뮤테이션
 *
 * 성공 시 전체 퀴즈 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useDeleteQuiz();
 * mutate(quizId);
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: number) => deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
    onError: (error) => {
      console.error('[퀴즈 삭제 실패]', getApiErrorMessage(error));
    },
  });
}
