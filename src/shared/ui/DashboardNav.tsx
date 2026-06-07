'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/features/auth/hooks';
import { useAuthStore } from '@/features/auth/store';

export function DashboardNav() {
  const pathname = usePathname();
  const { logout } = useLogout();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleLogout = () => {
    if (!isAuthenticated) return;
    // logout() 내부에서 서버 세션 무효화 + store 정리 + /login 이동을 처리합니다.
    void logout();
  };

  const navItems = [
    { href: '/dashboard/quizzes', label: '내 퀴즈' },
    { href: '/dashboard/ai-generate', label: 'AI 생성' },
  ];

  return (
    <header className="bg-canvas" style={{ height: 64, borderBottom: '2px solid var(--color-ink)' }}>
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        {/* 로고 — 크누피 (디스플레이 폰트) */}
        <Link href="/dashboard/quizzes" className="font-display text-2xl" style={{ color: 'var(--color-primary)' }}>
          크누피
        </Link>

        {/* 네비게이션 — active 는 하드 칩 */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
                style={{
                  color: isActive ? 'var(--color-on-primary)' : 'var(--color-muted)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  border: isActive ? '2px solid var(--color-ink)' : '2px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-hard-sm)' : 'none',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-muted)' }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
