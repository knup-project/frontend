import PlayerWaitingClient from '@/features/participants/ui/PlayerWaitingClient';

export default async function PlayWaitingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PlayerWaitingClient sessionId={sessionId} />
  );
}
