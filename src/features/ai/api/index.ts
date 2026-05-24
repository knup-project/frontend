import { apiClient } from '@/shared/api/client';
import type {
  AIExplainRequest,
  AIExplainResponse,
  AIQuestionType,
  AIQuizGenerateRequest,
  AIQuizGenerateResponse,
  Difficulty,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// PDF 업로드 파라미터
// ─────────────────────────────────────────────

export interface GenerateQuizFromPdfParams {
  file: File;
  questionCount?: number;
  questionType?: AIQuestionType;
  difficulty?: Difficulty;
}

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/**
 * 텍스트 기반 AI 퀴즈 생성
 */
export async function generateQuizFromText(
  request: AIQuizGenerateRequest,
): Promise<AIQuizGenerateResponse> {
  const { data } = await apiClient.post<AIQuizGenerateResponse>(
    '/ai/quiz/generate',
    request,
  );
  return data;
}

/**
 * PDF 기반 AI 퀴즈 생성 (multipart/form-data)
 */
export async function generateQuizFromPdf(
  params: GenerateQuizFromPdfParams,
): Promise<AIQuizGenerateResponse> {
  const { file, questionCount, questionType, difficulty } = params;

  const formData = new FormData();
  formData.append('file', file);
  if (questionCount !== undefined) {
    formData.append('questionCount', String(questionCount));
  }
  if (questionType) {
    formData.append('questionType', questionType);
  }
  if (difficulty) {
    formData.append('difficulty', difficulty);
  }

  const { data } = await apiClient.post<AIQuizGenerateResponse>(
    '/ai/quiz/generate/pdf',
    formData,
    // axios 가 FormData 를 감지하면 Content-Type 을 자동으로 multipart/form-data 로 설정
  );
  return data;
}

/**
 * AI 문제 해설 생성
 */
export async function generateExplanation(
  request: AIExplainRequest,
): Promise<AIExplainResponse> {
  const { data } = await apiClient.post<AIExplainResponse>(
    '/ai/explain',
    request,
  );
  return data;
}
