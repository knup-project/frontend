import type { GetMyQuizzesParams } from '../api';

/**
 * Quiz QueryKey 팩토리
 */
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (params?: GetMyQuizzesParams) => [...quizKeys.lists(), params] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (quizId: number) => [...quizKeys.details(), quizId] as const,
} as const;
