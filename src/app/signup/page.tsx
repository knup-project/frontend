import { SignupForm } from '@/features/auth/ui/SignupForm';
import { GuestGuard } from '@/shared/ui/GuestGuard';

export default function SignupPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen p-4 bg-surface-soft">
      <GuestGuard>
        <div className="w-full max-w-sm bg-canvas rounded-md border border-hairline p-8 shadow-[rgba(0,0,0,0.04)_0_2px_6px]">
          <SignupForm />
        </div>
      </GuestGuard>
    </main>
  );
}
