'use client';

import { useMutation } from '@tanstack/react-query';
import { kickParticipants } from '../api';

/**
 * 참가자 일괄/전체 강퇴 (호스트)
 *
 * participantIds 가 빈 배열이면 전체 강퇴. 성공 시 서버가 participants 를
 * 브로드캐스트하므로 목록은 소켓 이벤트로 갱신됩니다.
 */
export function useKickParticipants(sessionId: string) {
  return useMutation({
    mutationFn: (participantIds: string[]) => kickParticipants(sessionId, participantIds),
  });
}
