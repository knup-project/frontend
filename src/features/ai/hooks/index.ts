'use client';

import { useMutation } from '@tanstack/react-query';
import {
  generateExplanation,
  generateQuizFromPdf,
  generateQuizFromText,
  type GenerateQuizFromPdfParams,
} from '../api';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AIExplainRequest, AIQuizGenerateRequest } from '@/shared/types/api';

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

/**
 * PDF 기반 AI 퀴즈 생성
 *
 * @example
 * const { mutate, isPending } = useGenerateQuizFromPdf();
 * mutate({ file, questionCount: 10, questionType: 'MULTIPLE_CHOICE' });
 */
export function useGenerateQuizFromPdf() {
  return useMutation({
    mutationFn: (params: GenerateQuizFromPdfParams) => generateQuizFromPdf(params),
    onError: (error) => {
      console.error('[AI PDF 퀴즈 생성 실패]', getApiErrorMessage(error));
    },
  });
}

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
