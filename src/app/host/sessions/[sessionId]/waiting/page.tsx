import { HostWaitingClient } from '@/features/sessions/ui/HostWaitingClient';
import { AuthGuard } from '@/shared/ui/AuthGuard';

export default async function HostWaitingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <AuthGuard>
      <HostWaitingClient sessionId={sessionId} />
    </AuthGuard>
  );
}
