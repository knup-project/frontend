'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Client, type StompSubscription } from '@stomp/stompjs';
import {
  createSessionStompClient,
  publishAnswer,
  publishHeartbeat,
} from './index';
import type {
  SessionLeaderboardEvent,
  SessionParticipantsEvent,
  SessionQuestionEvent,
  SessionResultEvent,
  SessionStatusEvent,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// 인터페이스
// ─────────────────────────────────────────────

export interface UseSessionSocketParams {
  /** 연결할 세션 ID. null이면 연결하지 않음 */
  sessionId: string | null;
  /** 참가자 ID. 있으면 30초마다 자동 heartbeat 전송 */
  participantId?: string | null;
  /** false이면 연결하지 않음 (기본값: true) */
  enabled?: boolean;
  onQuestion?:     (event: SessionQuestionEvent) => void;
  onResult?:       (event: SessionResultEvent) => void;
  onLeaderboard?:  (event: SessionLeaderboardEvent) => void;
  onStatus?:       (event: SessionStatusEvent) => void;
  onParticipants?: (event: SessionParticipantsEvent) => void;
}

export interface UseSessionSocketReturn {
  /** STOMP 연결 완료 여부 */
  connected: boolean;
  /** 연결 진행 중 여부 */
  connecting: boolean;
  /** 연결 오류 */
  error: Error | null;
  /** 답변 발행 */
  sendAnswer: (payload: {
    participantId: string;
    questionId: number;
    answer: string;
  }) => void;
  /** heartbeat 발행 */
  sendHeartbeat: (participantId: string) => void;
  /** 수동 연결 해제 */
  disconnect: () => void;
}

// ─────────────────────────────────────────────
// useSessionSocket
// ─────────────────────────────────────────────

/**
 * STOMP WebSocket 세션 연결 훅
 *
 * @example 호스트 (연결 후 문제 이벤트 수신)
 * const { connected } = useSessionSocket({
 *   sessionId,
 *   onQuestion: (e) => setCurrentQuestion(e),
 *   onLeaderboard: (e) => updateLeaderboardCache(queryClient, sessionId, e),
 * });
 *
 * @example 참가자 (답변 제출 + 자동 heartbeat)
 * const { sendAnswer } = useSessionSocket({
 *   sessionId,
 *   participantId,
 *   onResult: (e) => setResult(e),
 * });
 * sendAnswer({ participantId, questionId: 1, answer: '1' });
 */
export function useSessionSocket(
  params: UseSessionSocketParams,
): UseSessionSocketReturn {
  const {
    sessionId,
    participantId,
    enabled = true,
    onQuestion,
    onResult,
    onLeaderboard,
    onStatus,
    onParticipants,
  } = params;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 콜백 최신값 유지 (stale closure 방지)
  const callbacksRef = useRef({ onQuestion, onResult, onLeaderboard, onStatus, onParticipants });
  useEffect(() => {
    callbacksRef.current = { onQuestion, onResult, onLeaderboard, onStatus, onParticipants };
  });

  // ── cleanup 함수 ────────────────────────────

  const cleanup = useCallback(() => {
    // heartbeat 타이머 제거
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    // 구독 해제
    subscriptionsRef.current.forEach((sub) => {
      try { sub.unsubscribe(); } catch { /* ignore */ }
    });
    subscriptionsRef.current = [];
    // 연결 해제
    if (clientRef.current) {
      try { clientRef.current.deactivate(); } catch { /* ignore */ }
      clientRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  // ── 연결 ────────────────────────────────────

  useEffect(() => {
    // enabled/sessionId 조건 미충족 시 그냥 반환
    // (이전 effect 의 cleanup 반환값이 자동으로 연결을 정리함)
    if (!enabled || !sessionId) return;

    setConnecting(true);
    setError(null);

    const { client, subscriptions } = createSessionStompClient({
      sessionId,
      callbacks: {
        onQuestion:     (e) => callbacksRef.current.onQuestion?.(e),
        onResult:       (e) => callbacksRef.current.onResult?.(e),
        onLeaderboard:  (e) => callbacksRef.current.onLeaderboard?.(e),
        onStatus:       (e) => callbacksRef.current.onStatus?.(e),
        onParticipants: (e) => callbacksRef.current.onParticipants?.(e),
      },
      onConnected: () => {
        setConnected(true);
        setConnecting(false);
        setError(null);
      },
      onDisconnected: () => {
        setConnected(false);
      },
      onConnectError: (err) => {
        setError(err);
        setConnecting(false);
        setConnected(false);
      },
    });

    clientRef.current = client;
    subscriptionsRef.current = subscriptions;

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, enabled]);

  // ── 30초 자동 heartbeat ──────────────────────

  useEffect(() => {
    if (!connected || !participantId || !sessionId) return;

    heartbeatTimerRef.current = setInterval(() => {
      if (clientRef.current) {
        publishHeartbeat(clientRef.current, sessionId, participantId);
      }
    }, 30_000);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [connected, participantId, sessionId]);

  // ── 공개 메서드 ─────────────────────────────

  const sendAnswer = useCallback(
    (payload: { participantId: string; questionId: number; answer: string }) => {
      if (!clientRef.current || !sessionId) return;
      publishAnswer(clientRef.current, sessionId, payload);
    },
    [sessionId],
  );

  const sendHeartbeat = useCallback(
    (pid: string) => {
      if (!clientRef.current || !sessionId) return;
      publishHeartbeat(clientRef.current, sessionId, pid);
    },
    [sessionId],
  );

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { connected, connecting, error, sendAnswer, sendHeartbeat, disconnect };
}
