import { HostResultClient } from '@/features/sessions/ui/HostResultClient';
import { AuthGuard } from '@/shared/ui/AuthGuard';

export default async function HostResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <AuthGuard>
      <HostResultClient sessionId={sessionId} />
    </AuthGuard>
  );
}
