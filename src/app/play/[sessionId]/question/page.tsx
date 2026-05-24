import PlayerQuestionClient from '@/features/participants/ui/PlayerQuestionClient';

export default async function PlayQuestionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PlayerQuestionClient sessionId={sessionId} />
  );
}
