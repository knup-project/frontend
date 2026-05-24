import PlayerLeaderboardClient from '@/features/participants/ui/PlayerLeaderboardClient';

export default async function PlayLeaderboardPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PlayerLeaderboardClient sessionId={sessionId} />
  );
}
