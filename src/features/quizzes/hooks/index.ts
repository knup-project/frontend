'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQuiz,
  deleteQuiz,
  getMyQuizzes,
  getQuiz,
  updateQuiz,
  type GetMyQuizzesParams,
} from '../api';
import { quizKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { QuizCreateRequest } from '@/shared/types/api';

export function useMyQuizzes(params?: GetMyQuizzesParams) {
  return useQuery({
    queryKey: quizKeys.list(params),
    queryFn: () => getMyQuizzes(params),
  });
}

export function useQuiz(quizId: number | undefined) {
  return useQuery({
    queryKey: quizKeys.detail(quizId!),
    queryFn: () => getQuiz(quizId!),
    enabled: quizId !== undefined,
  });
}

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
