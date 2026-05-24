import { apiClient } from '@/shared/api/client';
import type {
  AnswerResultResponse,
  AnswerSubmitRequest,
  JoinSessionRequest,
  JoinSessionResponse,
} from '@/shared/types/api';

/** 세션 참가 (인증 불필요) */
export async function joinSession(
  request: JoinSessionRequest,
): Promise<JoinSessionResponse> {
  const { data } = await apiClient.post<JoinSessionResponse>(
    '/sessions/join',
    request,
  );
  return data;
}

/**
 * 답변 제출
 *
 * Authorization 헤더 없이 X-Participant-Id 헤더로 참가자를 식별합니다.
 */
export async function submitAnswer(params: {
  sessionId: string;
  participantId: string;
  request: AnswerSubmitRequest;
}): Promise<AnswerResultResponse> {
  const { sessionId, participantId, request } = params;

  const { data } = await apiClient.post<AnswerResultResponse>(
    `/sessions/${sessionId}/answer`,
    request,
    {
      headers: { 'X-Participant-Id': participantId },
    },
  );
  return data;
}
