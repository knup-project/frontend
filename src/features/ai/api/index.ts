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

// Gemini 호출은 전역 타임아웃(10s)보다 오래 걸릴 수 있어 요청별로 늘린다.
const TEXT_GENERATE_TIMEOUT_MS = 60_000;
const PDF_GENERATE_TIMEOUT_MS = 120_000;

/**
 * 텍스트 기반 AI 퀴즈 생성
 */
export async function generateQuizFromText(
  request: AIQuizGenerateRequest,
): Promise<AIQuizGenerateResponse> {
  const { data } = await apiClient.post<AIQuizGenerateResponse>(
    '/ai/quiz/generate',
    request,
    { timeout: TEXT_GENERATE_TIMEOUT_MS },
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
    // FormData 는 브라우저가 multipart boundary 포함 Content-Type 을 설정한다
    { timeout: PDF_GENERATE_TIMEOUT_MS },
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
    { timeout: TEXT_GENERATE_TIMEOUT_MS },
  );
  return data;
}
