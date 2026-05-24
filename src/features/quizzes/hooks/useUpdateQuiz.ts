'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuiz } from '../api';
import { quizKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { QuizCreateRequest } from '@/shared/types/api';

/**
 * 퀴즈 수정 뮤테이션
 *
 * 성공 시 해당 퀴즈 detail + 목록 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useUpdateQuiz();
 * mutate({ quizId: 1, request: { title: '수정된 제목', questions: [...] } });
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, request }: { quizId: number; request: QuizCreateRequest }) =>
      updateQuiz(quizId, request),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error) => {
      console.error('[퀴즈 수정 실패]', getApiErrorMessage(error));
    },
  });
}
