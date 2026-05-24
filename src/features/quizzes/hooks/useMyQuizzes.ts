'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyQuizzes, type GetMyQuizzesParams } from '../api';
import { quizKeys } from '../types/keys';

/**
 * 내 퀴즈 목록 조회
 *
 * @example
 * const { data } = useMyQuizzes({ page: 0, size: 10 });
 */
export function useMyQuizzes(params?: GetMyQuizzesParams) {
  return useQuery({
    queryKey: quizKeys.list(params),
    queryFn: () => getMyQuizzes(params),
  });
}
