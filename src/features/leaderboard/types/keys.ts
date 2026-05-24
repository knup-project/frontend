/**
 * Leaderboard QueryKey 팩토리
 */
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  session: (sessionId: string) => [...leaderboardKeys.all, sessionId] as const,
  individual: (sessionId: string, top?: number) =>
    [...leaderboardKeys.session(sessionId), 'individual', top] as const,
  team: (sessionId: string) =>
    [...leaderboardKeys.session(sessionId), 'team'] as const,
  stats: (sessionId: string) =>
    [...leaderboardKeys.session(sessionId), 'stats'] as const,
} as const;
