import { apiClient } from '@/shared/api/client';
import type {
  PageResponse,
  QuizCreateRequest,
  QuizDetailResponse,
  QuizResponse,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// 목록 파라미터
// ─────────────────────────────────────────────

interface GetMyQuizzesParams {
  page?: number;
  size?: number;
  sort?: 'createdAt' | 'title';
}

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/**
 * 퀴즈 생성
 */
export async function createQuiz(
  request: QuizCreateRequest,
): Promise<QuizDetailResponse> {
  const { data } = await apiClient.post<QuizDetailResponse>('/quizzes', request);
  return data;
}

/**
 * 내 퀴즈 목록 조회 (페이지네이션)
 */
export async function getMyQuizzes(
  params?: GetMyQuizzesParams,
): Promise<PageResponse<QuizResponse>> {
  const { data } = await apiClient.get<PageResponse<QuizResponse>>('/quizzes/me', {
    params,
  });
  return data;
}

/**
 * 퀴즈 상세 조회
 */
export async function getQuiz(quizId: number): Promise<QuizDetailResponse> {
  const { data } = await apiClient.get<QuizDetailResponse>(`/quizzes/${quizId}`);
  return data;
}

/**
 * 퀴즈 수정
 */
export async function updateQuiz(
  quizId: number,
  request: QuizCreateRequest,
): Promise<QuizDetailResponse> {
  const { data } = await apiClient.put<QuizDetailResponse>(
    `/quizzes/${quizId}`,
    request,
  );
  return data;
}

/**
 * 퀴즈 삭제 (204 No Content)
 */
export async function deleteQuiz(quizId: number): Promise<void> {
  await apiClient.delete(`/quizzes/${quizId}`);
}
