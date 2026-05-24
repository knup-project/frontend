'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  endSession,
  getSession,
  nextQuestion,
  startSession,
} from './api';
import { sessionKeys } from './keys';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SessionCreateRequest, SessionStatus } from '@/shared/types/api';

// ─────────────────────────────────────────────
// useSession
// ─────────────────────────────────────────────

/**
 * 세션 조회
 *
 * sessionId가 없으면 쿼리 비활성화
 * status 분기 편의를 위한 파생 값 반환
 *
 * @example
 * const { data, isWaiting, isInProgress, isFinished } = useSession(sessionId);
 */
export function useSession(sessionId: string | null | undefined) {
  const query = useQuery({
    queryKey: sessionKeys.detail(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      // WAITING 상태에서는 3초마다 폴링 (참가자 수 갱신 등)
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

// ─────────────────────────────────────────────
// useCreateSession
// ─────────────────────────────────────────────

/**
 * 세션 생성 (호스트)
 *
 * @example
 * const { mutate } = useCreateSession();
 * mutate({ quizId, mode: 'INDIVIDUAL' });
 */
export function useCreateSession() {
  return useMutation({
    mutationFn: (request: SessionCreateRequest) => createSession(request),
    onError: (error) => {
      console.error('[세션 생성 실패]', getApiErrorMessage(error));
    },
  });
}

// ─────────────────────────────────────────────
// useStartSession
// ─────────────────────────────────────────────

/**
 * 세션 시작 (호스트)
 *
 * 성공 시 해당 세션 캐시 무효화
 *
 * @example
 * const { mutate } = useStartSession();
 * mutate(sessionId);
 */
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

// ─────────────────────────────────────────────
// useNextQuestion
// ─────────────────────────────────────────────

/**
 * 다음 문제로 이동 (호스트)
 *
 * @example
 * const { mutate } = useNextQuestion();
 * mutate(sessionId);
 */
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

// ─────────────────────────────────────────────
// useEndSession
// ─────────────────────────────────────────────

/**
 * 세션 종료 (호스트)
 *
 * 성공 시 최종 리더보드와 통계 포함 응답 반환
 *
 * @example
 * const { mutate, data } = useEndSession();
 * mutate(sessionId);
 * // data.finalLeaderboard, data.totalParticipants, data.sessionDurationSec
 */
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
