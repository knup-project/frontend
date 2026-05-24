/**
 * 리더보드 (참가자)
 * 사용 훅: useLeaderboard, useTeamLeaderboard
 */
export default function PlayLeaderboardPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 p-4 md:p-8">
      {/* TODO: LeaderboardTable, TeamLeaderboard 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>리더보드</p>
    </main>
  );
}
