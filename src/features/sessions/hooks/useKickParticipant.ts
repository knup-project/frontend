'use client';

import { useMutation } from '@tanstack/react-query';
import { deleteParticipant } from '../api';

/**
 * 참가자 강퇴 (호스트)
 *
 * 성공 시 서버가 /topic/.../participants 로 갱신된 목록을 브로드캐스트하므로
 * 별도 invalidate 없이 소켓 이벤트로 목록이 갱신됩니다.
 */
export function useKickParticipant(sessionId: string) {
  return useMutation({
    mutationFn: (participantId: string) => deleteParticipant(sessionId, participantId),
  });
}
