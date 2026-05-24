'use client';

import { useMutation } from '@tanstack/react-query';
import { joinSession, submitAnswer } from './api';
import { useParticipantStore } from './store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AnswerSubmitRequest, JoinSessionRequest } from '@/shared/types/api';

// ─────────────────────────────────────────────
// useJoinSession
// ─────────────────────────────────────────────

/**
 * 세션 참가 뮤테이션
 *
 * 성공 시 participant store에 참가자 정보 저장
 *
 * @example
 * const { mutate, isPending } = useJoinSession();
 * mutate({ pin: '1234', nickname: '홍길동' });
 */
export function useJoinSession() {
  const setParticipant = useParticipantStore((s) => s.setParticipant);

  return useMutation({
    mutationFn: (request: JoinSessionRequest) => joinSession(request),
    onSuccess: (response) => {
      setParticipant(response);
      // 필요 시 router.push(`/play/${response.sessionId}/waiting`) 호출
    },
    onError: (error) => {
      console.error('[세션 참가 실패]', getApiErrorMessage(error));
    },
  });
}

// ─────────────────────────────────────────────
// useSubmitAnswer
// ─────────────────────────────────────────────

/**
 * 답변 제출 뮤테이션
 *
 * participant store에서 participantId와 sessionId를 자동으로 읽어 사용합니다.
 *
 * @example
 * const { mutate } = useSubmitAnswer();
 * mutate({ questionId: 1, answer: '1', responseTimeSec: 5 });
 */
export function useSubmitAnswer() {
  const { participantId, sessionId } = useParticipantStore((s) => ({
    participantId: s.participantId,
    sessionId: s.sessionId,
  }));

  return useMutation({
    mutationFn: (request: AnswerSubmitRequest) => {
      if (!participantId || !sessionId) {
        throw new Error('참가자 정보가 없습니다. 세션에 다시 참가해 주세요.');
      }
      return submitAnswer({ sessionId, participantId, request });
    },
    onError: (error) => {
      console.error('[답변 제출 실패]', getApiErrorMessage(error));
    },
  });
}
