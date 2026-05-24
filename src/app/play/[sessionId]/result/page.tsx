import PlayerResultClient from '@/features/participants/ui/PlayerResultClient';

export default async function PlayResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PlayerResultClient sessionId={sessionId} />
  );
}
