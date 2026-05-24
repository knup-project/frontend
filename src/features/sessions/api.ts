import { apiClient } from '@/shared/api/client';
import type {
  LeaderboardEntry,
  SessionCreateRequest,
  SessionResponse,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// 응답 타입 (sessions 전용)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/**
 * 세션 생성 (호스트)
 */
export async function createSession(
  request: SessionCreateRequest,
): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>('/sessions', request);
  return data;
}

/**
 * 세션 조회 (인증 불필요)
 */
export async function getSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>(`/sessions/${sessionId}`);
  return data;
}

/**
 * 세션 시작 (호스트)
 */
export async function startSession(sessionId: string): Promise<void> {
  await apiClient.post(`/sessions/${sessionId}/start`);
}

/**
 * 다음 문제로 이동 (호스트)
 */
export async function nextQuestion(
  sessionId: string,
): Promise<NextQuestionResponse> {
  const { data } = await apiClient.post<NextQuestionResponse>(
    `/sessions/${sessionId}/next`,
  );
  return data;
}

/**
 * 세션 종료 (호스트)
 */
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  const { data } = await apiClient.post<EndSessionResponse>(
    `/sessions/${sessionId}/end`,
  );
  return data;
}
