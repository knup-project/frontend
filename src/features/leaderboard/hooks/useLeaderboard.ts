'use client';

import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../api';
import { leaderboardKeys } from '../types/keys';

/**
 * 개인 리더보드 조회
 *
 * sessionId 없으면 비활성화.
 * WebSocket 이벤트 수신 시 updateLeaderboardCache 헬퍼로 캐시를 직접 업데이트합니다.
 *
 * @example
 * const { data } = useLeaderboard(sessionId, 10);
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
