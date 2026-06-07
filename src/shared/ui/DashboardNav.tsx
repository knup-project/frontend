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
    <header
      className="bg-white border-b border-[#dddddd]"
      style={{ height: '64px' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/dashboard/quizzes"
          style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}
        >
          KNU-P
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
                  fontSize: '16px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#222222' : '#6a6a6a',
                  borderBottom: isActive ? '2px solid #222222' : 'none',
                  paddingBottom: '2px',
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
          style={{ fontSize: '14px', color: '#6a6a6a', fontWeight: 500 }}
          className="hover:text-[#222222] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
