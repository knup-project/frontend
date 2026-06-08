'use client';

import { useMutation } from '@tanstack/react-query';
import { submitAnswer } from '../api';
import { useParticipantStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AnswerSubmitRequest } from '@/shared/types/api';

/**
 * 답변 제출 뮤테이션
 *
 * store 에서 participantId / sessionId 를 자동으로 읽어 X-Participant-Id 헤더로 전송
 *
 * @example
 * const { mutate } = useSubmitAnswer();
 * mutate({ questionId: 1, answer: '1', responseTimeSec: 5 });
 */
export function useSubmitAnswer() {
  const participantId = useParticipantStore((s) => s.participantId);
  const sessionId = useParticipantStore((s) => s.sessionId);

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
