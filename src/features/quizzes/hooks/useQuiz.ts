'use client';

import { useQuery } from '@tanstack/react-query';
import { getQuiz } from '../api';
import { quizKeys } from '../types/keys';

/**
 * 퀴즈 단건 조회
 *
 * quizId 없으면 비활성화.
 *
 * @example
 * const { data } = useQuiz(quizId);
 */
export function useQuiz(quizId: number | undefined) {
  return useQuery({
    queryKey: quizKeys.detail(quizId!),
    queryFn: () => getQuiz(quizId!),
    enabled: quizId !== undefined,
  });
}
