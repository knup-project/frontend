import { apiClient } from '@/shared/api/client';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/shared/types/api';

// ─────────────────────────────────────────────
// 응답 타입
// ─────────────────────────────────────────────

export interface LeaderboardResponse {
  sessionId: string;
  currentQuestion: number;
  entries: LeaderboardEntry[];
}

export interface TeamLeaderboardResponse {
  entries: TeamLeaderboardEntry[];
}

export interface SessionStatsResponse {
  totalParticipants: number;
  currentQuestionIndex: number;
  overallAccuracy: number;
  answerDistribution: Record<string, number>;
  answeredCount: number;
  averageResponseTimeSec: number;
}

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/**
 * 개인 리더보드 조회 (인증 불필요)
 *
 * @param sessionId - 세션 ID
 * @param top - 상위 N명만 조회 (미설정 시 전체)
 */
export async function getLeaderboard(
  sessionId: string,
  top?: number,
): Promise<LeaderboardResponse> {
  const { data } = await apiClient.get<LeaderboardResponse>(
    `/sessions/${sessionId}/leaderboard`,
    { params: top ? { top } : undefined },
  );
  return data;
}

/**
 * 팀 리더보드 조회 (인증 불필요)
 */
export async function getTeamLeaderboard(
  sessionId: string,
): Promise<TeamLeaderboardResponse> {
  const { data } = await apiClient.get<TeamLeaderboardResponse>(
    `/sessions/${sessionId}/leaderboard/teams`,
  );
  return data;
}

/**
 * 세션 통계 조회
 */
export async function getSessionStats(
  sessionId: string,
): Promise<SessionStatsResponse> {
  const { data } = await apiClient.get<SessionStatsResponse>(
    `/sessions/${sessionId}/stats`,
  );
  return data;
}
