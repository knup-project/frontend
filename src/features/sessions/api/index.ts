import { apiClient } from '@/shared/api/client';
import type {
  LeaderboardEntry,
  SessionCreateRequest,
  SessionResponse,
} from '@/shared/types/api';

export interface NextQuestionResponse {
  questionIndex: number;
  totalQuestions: number;
  isLast: boolean;
}

export interface EndSessionResponse {
  finalLeaderboard: LeaderboardEntry[];
  totalParticipants: number;
  sessionDurationSec: number;
}

export async function createSession(
  request: SessionCreateRequest,
): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>('/sessions', request);
  return data;
}

/** 세션 조회 (인증 불필요) */
export async function getSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>(`/sessions/${sessionId}`);
  return data;
}

export async function startSession(sessionId: string): Promise<void> {
  await apiClient.post(`/sessions/${sessionId}/start`);
}

export async function nextQuestion(
  sessionId: string,
): Promise<NextQuestionResponse> {
  const { data } = await apiClient.post<NextQuestionResponse>(
    `/sessions/${sessionId}/next`,
  );
  return data;
}

export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  const { data } = await apiClient.post<EndSessionResponse>(
    `/sessions/${sessionId}/end`,
  );
  return data;
}

/** 참가자 강퇴 (호스트) */
export async function deleteParticipant(
  sessionId: string,
  participantId: string,
): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}/participants/${participantId}`);
}
