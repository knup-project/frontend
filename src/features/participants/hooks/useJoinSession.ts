'use client';

import { useMutation } from '@tanstack/react-query';
import { joinSession } from '../api';
import { useParticipantStore } from '../store';
import { getApiErrorMessage } from '@/shared/api/error';
import type { JoinSessionRequest } from '@/shared/types/api';

/**
 * 세션 참가 뮤테이션
 *
 * 성공 시 participant store 에 참가자 정보 저장
 *
 * @example
 * const { mutate } = useJoinSession();
 * mutate({ pin: '1234', nickname: '홍길동' });
 */
export function useJoinSession() {
  const setParticipant = useParticipantStore((s) => s.setParticipant);

  return useMutation({
    mutationFn: (request: JoinSessionRequest) => joinSession(request),
    onSuccess: (response) => {
      setParticipant(response);
    },
    onError: (error) => {
      console.error('[세션 참가 실패]', getApiErrorMessage(error));
    },
  });
}
