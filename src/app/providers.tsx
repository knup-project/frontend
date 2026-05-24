'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * 전역 Provider 컴포넌트
 *
 * - QueryClientProvider: TanStack Query 전역 클라이언트
 * - ReactQueryDevtools: 개발 환경에서만 노출
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 클라이언트 인스턴스를 useState로 생성해 SSR과 CSR 간 공유 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 창 포커스 시 자동 재요청 (기본 true)
            refetchOnWindowFocus: false,
            // 실패한 쿼리 재시도 횟수
            retry: 1,
            // 데이터 신선도 유지 시간 (ms) — 0이면 항상 stale
            staleTime: 1000 * 60, // 1분
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 ReactQueryDevtools 노출 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
