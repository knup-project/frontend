'use client';

import { useQuery } from '@tanstack/react-query';
import { getSession } from '../api';
import { sessionKeys } from '../types/keys';
import type { SessionStatus } from '@/shared/types/api';

/**
 * 세션 조회
 *
 * - sessionId 없으면 비활성화
 * - WAITING 상태일 때 3초 폴링 (참가자 수 갱신)
 * - IN_PROGRESS 상태일 때 5초 폴링 — WS question/status 이벤트를 놓쳐도
 *   currentQuestion / status 로 복구할 수 있는 폴백
 * - isWaiting / isInProgress / isFinished 파생값 반환
 *
 * @example
 * const { data, isWaiting, isInProgress } = useSession(sessionId);
 */
export function useSession(sessionId: string | null | undefined) {
  const query = useQuery({
    queryKey: sessionKeys.detail(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      if (query.state.data?.status === 'WAITING') return 3_000;
      if (query.state.data?.status === 'IN_PROGRESS') return 5_000;
      return false;
    },
  });

  const status: SessionStatus | undefined = query.data?.status;

  return {
    ...query,
    isWaiting: status === 'WAITING',
    isInProgress: status === 'IN_PROGRESS',
    isFinished: status === 'FINISHED',
  };
}
