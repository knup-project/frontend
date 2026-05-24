'use client';

import { useQuery } from '@tanstack/react-query';
import { getSessionStats } from '../api';
import { leaderboardKeys } from '../types/keys';

/**
 * 세션 통계 조회
 *
 * sessionId 없으면 비활성화.
 *
 * @example
 * const { data } = useSessionStats(sessionId);
 */
export function useSessionStats(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: leaderboardKeys.stats(sessionId!),
    queryFn: () => getSessionStats(sessionId!),
    enabled: !!sessionId,
  });
}
