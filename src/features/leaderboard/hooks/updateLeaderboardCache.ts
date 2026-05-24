import { useQueryClient } from '@tanstack/react-query';
import { type LeaderboardResponse } from '../api';
import { leaderboardKeys } from '../types/keys';
import type { SessionLeaderboardEvent } from '@/shared/types/api';

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
