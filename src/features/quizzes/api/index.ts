import { apiClient } from '@/shared/api/client';
import type {
  PageResponse,
  QuizCreateRequest,
  QuizDetailResponse,
  QuizResponse,
} from '@/shared/types/api';

export interface GetMyQuizzesParams {
  page?: number;
  size?: number;
  sort?: 'createdAt' | 'title';
}

export async function createQuiz(
  request: QuizCreateRequest,
): Promise<QuizDetailResponse> {
  const { data } = await apiClient.post<QuizDetailResponse>('/quizzes', request);
  return data;
}

export async function getMyQuizzes(
  params?: GetMyQuizzesParams,
): Promise<PageResponse<QuizResponse>> {
  const { data } = await apiClient.get<PageResponse<QuizResponse>>('/quizzes/me', {
    params,
  });
  return data;
}

export async function getQuiz(quizId: number): Promise<QuizDetailResponse> {
  const { data } = await apiClient.get<QuizDetailResponse>(`/quizzes/${quizId}`);
  return data;
}

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

export async function deleteQuiz(quizId: number): Promise<void> {
  await apiClient.delete(`/quizzes/${quizId}`);
}
