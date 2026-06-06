'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { me } from '../api';
import { useAuthStore } from '../store';

/**
 * 세션 복원(hydration) 훅
 *
 * 앱 로드 시 GET /auth/me 로 세션 쿠키 유효성을 검증합니다.
 *   - 200: auth store 에 사용자 정보를 채우고 인증 상태로 표시
 *   - 401: 로그아웃 상태로 간주하여 store 를 비움
 *
 * 세션 쿠키(httpOnly)는 JS 에서 읽을 수 없으므로,
 * 새로고침 후 유효한 쿠키를 인식하려면 이 호출이 필요합니다.
 */
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    retry: (failureCount, error) => {
      // 401(로그아웃)은 재시도하지 않음
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
      return;
    }
    if (
      query.error instanceof AxiosError &&
      query.error.response?.status === 401
    ) {
      clear();
    }
  }, [query.data, query.error, setUser, clear]);

  return query;
}
