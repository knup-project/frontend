'use client';

import { useMutation } from '@tanstack/react-query';
import { generateExplanation } from '../api';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AIExplainRequest } from '@/shared/types/api';

/**
 * AI 문제 해설 생성
 *
 * @example
 * const { mutate, data } = useGenerateExplanation();
 * mutate({ questionId: 1, participantAnswer: '2' });
 */
export function useGenerateExplanation() {
  return useMutation({
    mutationFn: (request: AIExplainRequest) => generateExplanation(request),
    onError: (error) => {
      console.error('[AI 해설 생성 실패]', getApiErrorMessage(error));
    },
  });
}
