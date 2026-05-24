'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamLeaderboard } from '../api';
import { leaderboardKeys } from '../types/keys';

/**
 * 팀 리더보드 조회
 *
 * sessionId 없으면 비활성화.
 *
 * @example
 * const { data } = useTeamLeaderboard(sessionId);
 */
export function useTeamLeaderboard(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: leaderboardKeys.team(sessionId!),
    queryFn: () => getTeamLeaderboard(sessionId!),
    enabled: !!sessionId,
  });
}
