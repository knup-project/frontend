'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLeaderboard,
  getSessionStats,
  getTeamLeaderboard,
  type LeaderboardResponse,
} from '../api';
import { leaderboardKeys } from '../types/keys';
import type { SessionLeaderboardEvent } from '@/shared/types/api';

// ─────────────────────────────────────────────
// useLeaderboard
// ─────────────────────────────────────────────

/**
 * 개인 리더보드 조회
 *
 * sessionId 없으면 비활성화.
 * WebSocket 이벤트 수신 시 아래 패턴으로 캐시를 직접 업데이트 합니다:
 *
 * @example WebSocket 캐시 업데이트
 * ```ts
 * const queryClient = useQueryClient();
 * // socket-hooks.ts 의 onLeaderboard 콜백에서:
 * onLeaderboard: (event: SessionLeaderboardEvent) => {
 *   queryClient.setQueryData(
 *     leaderboardKeys.individual(sessionId, top),
 *     (prev: LeaderboardResponse | undefined) => prev
 *       ? { ...prev, entries: event.entries, currentQuestion: event.currentQuestion }
 *       : prev,
 *   );
 * }
 * ```
 */
export function useLeaderboard(
  sessionId: string | null | undefined,
  top?: number,
) {
  return useQuery({
    queryKey: leaderboardKeys.individual(sessionId!, top),
    queryFn: () => getLeaderboard(sessionId!, top),
    enabled: !!sessionId,
  });
}

// ─────────────────────────────────────────────
// useTeamLeaderboard
// ─────────────────────────────────────────────

/**
 * 팀 리더보드 조회
 *
 * sessionId 없으면 비활성화.
 */
export function useTeamLeaderboard(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: leaderboardKeys.team(sessionId!),
    queryFn: () => getTeamLeaderboard(sessionId!),
    enabled: !!sessionId,
  });
}

// ─────────────────────────────────────────────
// useSessionStats
// ─────────────────────────────────────────────

/**
 * 세션 통계 조회
 *
 * sessionId 없으면 비활성화.
 */
export function useSessionStats(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: leaderboardKeys.stats(sessionId!),
    queryFn: () => getSessionStats(sessionId!),
    enabled: !!sessionId,
  });
}

// ─────────────────────────────────────────────
// WebSocket 이벤트 → 캐시 업데이트 헬퍼
// ─────────────────────────────────────────────

/**
 * WebSocket 리더보드 이벤트를 받아 TanStack Query 캐시를 즉시 업데이트하는 헬퍼
 *
 * socket-hooks.ts 의 onLeaderboard 콜백에서 호출하세요.
 * REST 폴링 없이도 실시간 리더보드를 반영합니다.
 *
 * @example
 * const queryClient = useQueryClient();
 * // useSessionSocket({ onLeaderboard: (e) => updateLeaderboardCache(queryClient, sessionId, e) })
 */
export function updateLeaderboardCache(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionId: string,
  event: SessionLeaderboardEvent,
  top?: number,
) {
  queryClient.setQueryData<LeaderboardResponse>(
    leaderboardKeys.individual(sessionId, top),
    (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentQuestion: event.currentQuestion,
        entries: event.entries,
      };
    },
  );
}
