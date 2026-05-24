'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuiz } from '../api';
import { quizKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { QuizCreateRequest } from '@/shared/types/api';

/**
 * 퀴즈 생성 뮤테이션
 *
 * 성공 시 퀴즈 목록 쿼리 자동 invalidate
 *
 * @example
 * const { mutate } = useCreateQuiz();
 * mutate({ title: '퀴즈 제목', questions: [...] });
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: QuizCreateRequest) => createQuiz(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error) => {
      console.error('[퀴즈 생성 실패]', getApiErrorMessage(error));
    },
  });
}
