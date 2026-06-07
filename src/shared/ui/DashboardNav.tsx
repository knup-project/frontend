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
    <header className="bg-canvas" style={{ height: 64, borderBottom: '1px solid var(--color-hairline)' }}>
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        {/* 로고 — 크누피 */}
        <Link
          href="/dashboard/quizzes"
          className="flex items-center gap-2"
          style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}
        >
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 14 }}
          >
            ?
          </span>
          크누피
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  paddingBottom: 2,
                  transition: 'color 150ms ease',
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
          style={{ fontSize: 14, color: 'var(--color-muted)', fontWeight: 600 }}
          className="hover:opacity-70 transition-opacity"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
