'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createQuiz,
  deleteQuiz,
  getMyQuizzes,
  getQuiz,
  updateQuiz,
} from './api';
import { quizKeys } from './keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { QuizCreateRequest } from '@/shared/types/api';

// ─────────────────────────────────────────────
// 목록 파라미터 타입
// ─────────────────────────────────────────────

interface QuizListParams {
  page?: number;
  size?: number;
  sort?: 'createdAt' | 'title';
}

// ─────────────────────────────────────────────
// Query Hooks
// ─────────────────────────────────────────────

/**
 * 내 퀴즈 목록 조회
 *
 * @example
 * const { data, isLoading } = useMyQuizzes({ page: 0, size: 10 });
 */
export function useMyQuizzes(params?: QuizListParams) {
  return useQuery({
    queryKey: quizKeys.list(params),
    queryFn: () => getMyQuizzes(params),
  });
}

/**
 * 퀴즈 상세 조회
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

// ─────────────────────────────────────────────
// Mutation Hooks
// ─────────────────────────────────────────────

/**
 * 퀴즈 생성
 *
 * 성공 시 퀴즈 목록 캐시 무효화
 *
 * @example
 * const { mutate, isPending } = useCreateQuiz();
 * mutate({ title, questions });
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

/**
 * 퀴즈 수정
 *
 * 성공 시 해당 퀴즈 상세 + 목록 캐시 무효화
 *
 * @example
 * const { mutate } = useUpdateQuiz();
 * mutate({ quizId, request: { title, questions } });
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      request,
    }: {
      quizId: number;
      request: QuizCreateRequest;
    }) => updateQuiz(quizId, request),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error) => {
      console.error('[퀴즈 수정 실패]', getApiErrorMessage(error));
    },
  });
}

/**
 * 퀴즈 삭제
 *
 * 성공 시 퀴즈 전체 캐시 무효화
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
