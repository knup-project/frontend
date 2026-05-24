'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  endSession,
  getSession,
  nextQuestion,
  startSession,
} from '../api';
import { sessionKeys } from '../types/keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SessionCreateRequest, SessionStatus } from '@/shared/types/api';

/**
 * 세션 조회
 *
 * - sessionId 없으면 비활성화
 * - WAITING 상태일 때 3초 폴링 (참가자 수 갱신)
 * - isWaiting / isInProgress / isFinished 파생값 반환
 */
export function useSession(sessionId: string | null | undefined) {
  const query = useQuery({
    queryKey: sessionKeys.detail(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'WAITING') return 3_000;
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

export function useCreateSession() {
  return useMutation({
    mutationFn: (request: SessionCreateRequest) => createSession(request),
    onError: (error) => {
      console.error('[세션 생성 실패]', getApiErrorMessage(error));
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => startSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[세션 시작 실패]', getApiErrorMessage(error));
    },
  });
}

export function useNextQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => nextQuestion(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[다음 문제 이동 실패]', getApiErrorMessage(error));
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => endSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
    onError: (error) => {
      console.error('[세션 종료 실패]', getApiErrorMessage(error));
    },
  });
}
