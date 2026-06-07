import { AuthGuard } from '@/shared/ui/AuthGuard';
import { DashboardNav } from '@/shared/ui/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-surface-soft">
        <DashboardNav />
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
