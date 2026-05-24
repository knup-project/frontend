import { HostPlayClient } from '@/features/sessions/ui/HostPlayClient';
import { AuthGuard } from '@/shared/ui/AuthGuard';

export default async function HostPlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <AuthGuard>
      <HostPlayClient sessionId={sessionId} />
    </AuthGuard>
  );
}
