'use client';

import { useMutation } from '@tanstack/react-query';
import { generateQuizFromText } from '../api';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AIQuizGenerateRequest } from '@/shared/types/api';

/**
 * 텍스트 기반 AI 퀴즈 생성
 *
 * @example
 * const { mutate, isPending, data } = useGenerateQuizFromText();
 * mutate({ text: '...내용...', questionCount: 5, difficulty: 'MEDIUM' });
 */
export function useGenerateQuizFromText() {
  return useMutation({
    mutationFn: (request: AIQuizGenerateRequest) => generateQuizFromText(request),
    onError: (error) => {
      console.error('[AI 퀴즈 생성 실패]', getApiErrorMessage(error));
    },
  });
}
