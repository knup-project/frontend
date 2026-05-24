/**
 * Quiz QueryKey 팩토리
 *
 * TanStack Query 캐시를 일관되게 관리하기 위한 키 팩토리 패턴
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: quizKeys.all })
 * queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
 * queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) })
 */

interface QuizListParams {
  page?: number;
  size?: number;
  sort?: 'createdAt' | 'title';
}

export const quizKeys = {
  /** 퀴즈 전체 (모든 하위 키 포함) */
  all: ['quizzes'] as const,

  /** 목록 계열 */
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (params?: QuizListParams) => [...quizKeys.lists(), params] as const,

  /** 상세 계열 */
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (quizId: number) => [...quizKeys.details(), quizId] as const,
} as const;
