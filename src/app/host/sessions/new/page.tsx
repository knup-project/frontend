import { NewSessionClient } from '@/features/sessions/ui/NewSessionClient';
import { AuthGuard } from '@/shared/ui/AuthGuard';

export default function NewSessionPage() {
  return (
    <AuthGuard>
      <NewSessionClient />
    </AuthGuard>
  );
}
