import { LoginForm } from '@/features/auth/ui/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen p-4 bg-[#f7f7f7]">
      <div className="w-full max-w-sm bg-white rounded-[14px] border border-[#dddddd] p-8 shadow-[rgba(0,0,0,0.04)_0_2px_6px]">
        <LoginForm />
      </div>
    </main>
  );
}
