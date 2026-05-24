/**
 * src/features/sessions/socket/index.ts
 *
 * STOMP over WebSocket 클라이언트 팩토리
 *
 * 라이브러리: @stomp/stompjs + sockjs-client (SockJS fallback)
 * 연결 URL: NEXT_PUBLIC_WS_URL (ws://api.knup.site/ws)
 *
 * 구독 토픽:
 *   /topic/session/{sessionId}/question
 *   /topic/session/{sessionId}/result
 *   /topic/session/{sessionId}/leaderboard
 *   /topic/session/{sessionId}/status
 *   /topic/session/{sessionId}/participants
 *
 * 발행 destination:
 *   /app/session/{sessionId}/answer
 *   /app/session/{sessionId}/heartbeat
 */

import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENV } from '@/shared/constants/env';
import type {
  SessionLeaderboardEvent,
  SessionParticipantsEvent,
  SessionQuestionEvent,
  SessionResultEvent,
  SessionStatusEvent,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// 구독 토픽 생성 헬퍼
// ─────────────────────────────────────────────

export const sessionTopics = (sessionId: string) => ({
  question:     `/topic/session/${sessionId}/question`,
  result:       `/topic/session/${sessionId}/result`,
  leaderboard:  `/topic/session/${sessionId}/leaderboard`,
  status:       `/topic/session/${sessionId}/status`,
  participants: `/topic/session/${sessionId}/participants`,
}) as const;

export const sessionDestinations = (sessionId: string) => ({
  answer:    `/app/session/${sessionId}/answer`,
  heartbeat: `/app/session/${sessionId}/heartbeat`,
}) as const;

// ─────────────────────────────────────────────
// 콜백 타입
// ─────────────────────────────────────────────

export interface SessionSocketCallbacks {
  onQuestion?:     (event: SessionQuestionEvent) => void;
  onResult?:       (event: SessionResultEvent) => void;
  onLeaderboard?:  (event: SessionLeaderboardEvent) => void;
  onStatus?:       (event: SessionStatusEvent) => void;
  onParticipants?: (event: SessionParticipantsEvent) => void;
  onConnect?:      () => void;
  onDisconnect?:   () => void;
  onError?:        (error: Error) => void;
}

// ─────────────────────────────────────────────
// STOMP 클라이언트 생성 팩토리
// ─────────────────────────────────────────────

/**
 * STOMP 클라이언트를 생성하고 연결·구독까지 처리합니다.
 *
 * @returns 구독 목록과 클라이언트 (cleanup용)
 *
 * @example
 * const { client, subscriptions } = createSessionStompClient({
 *   sessionId: 'abc',
 *   callbacks: { onQuestion: (e) => console.log(e) },
 *   onConnected: () => setConnected(true),
 *   onDisconnected: () => setConnected(false),
 * });
 * // cleanup
 * subscriptions.forEach((s) => s.unsubscribe());
 * client.deactivate();
 */
export function createSessionStompClient(options: {
  sessionId: string;
  callbacks: SessionSocketCallbacks;
  onConnected: () => void;
  onDisconnected: () => void;
  onConnectError: (error: Error) => void;
}): { client: Client; subscriptions: StompSubscription[] } {
  const { sessionId, callbacks, onConnected, onDisconnected, onConnectError } = options;
  const topics = sessionTopics(sessionId);
  const subscriptions: StompSubscription[] = [];

  const client = new Client({
    // SockJS fallback: WebSocket 미지원 환경에서 long-polling 등으로 대체
    webSocketFactory: () => new SockJS(ENV.WS_URL),

    // 재연결 딜레이 (ms)
    reconnectDelay: 5_000,

    // heartbeat (ms) — 서버/클라이언트 양방향
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,

    onConnect: () => {
      // ── 구독 등록 ──────────────────────────────

      subscriptions.push(
        client.subscribe(topics.question, (msg) => {
          try {
            callbacks.onQuestion?.(JSON.parse(msg.body) as SessionQuestionEvent);
          } catch { /* JSON 파싱 오류 무시 */ }
        }),
      );

      subscriptions.push(
        client.subscribe(topics.result, (msg) => {
          try {
            callbacks.onResult?.(JSON.parse(msg.body) as SessionResultEvent);
          } catch { /* ignore */ }
        }),
      );

      subscriptions.push(
        client.subscribe(topics.leaderboard, (msg) => {
          try {
            callbacks.onLeaderboard?.(JSON.parse(msg.body) as SessionLeaderboardEvent);
          } catch { /* ignore */ }
        }),
      );

      subscriptions.push(
        client.subscribe(topics.status, (msg) => {
          try {
            callbacks.onStatus?.(JSON.parse(msg.body) as SessionStatusEvent);
          } catch { /* ignore */ }
        }),
      );

      subscriptions.push(
        client.subscribe(topics.participants, (msg) => {
          try {
            callbacks.onParticipants?.(JSON.parse(msg.body) as SessionParticipantsEvent);
          } catch { /* ignore */ }
        }),
      );

      callbacks.onConnect?.();
      onConnected();
    },

    onDisconnect: () => {
      callbacks.onDisconnect?.();
      onDisconnected();
    },

    onStompError: (frame) => {
      const error = new Error(frame.headers?.message ?? 'STOMP 연결 오류');
      callbacks.onError?.(error);
      onConnectError(error);
    },

    onWebSocketError: (_event) => {
      const error = new Error('WebSocket 연결 실패');
      callbacks.onError?.(error);
      onConnectError(error);
    },
  });

  client.activate();

  return { client, subscriptions };
}

// ─────────────────────────────────────────────
// publish 헬퍼
// ─────────────────────────────────────────────

export function publishAnswer(
  client: Client,
  sessionId: string,
  payload: { participantId: string; questionId: number; answer: string },
): void {
  if (!client.connected) {
    console.warn('[WebSocket] 연결되지 않은 상태에서 answer 발행 시도');
    return;
  }
  client.publish({
    destination: sessionDestinations(sessionId).answer,
    body: JSON.stringify(payload),
  });
}

export function publishHeartbeat(
  client: Client,
  sessionId: string,
  participantId: string,
): void {
  if (!client.connected) return;
  client.publish({
    destination: sessionDestinations(sessionId).heartbeat,
    body: JSON.stringify({ participantId }),
  });
}
