'use client';

import { useMutation } from '@tanstack/react-query';
import { generateQuizFromPdf, type GenerateQuizFromPdfParams } from '../api';
import { getApiErrorMessage } from '@/shared/api/error';

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
