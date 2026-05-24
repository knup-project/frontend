import { apiClient } from '@/shared/api/client';
import type {
  AnswerResultResponse,
  AnswerSubmitRequest,
  JoinSessionRequest,
  JoinSessionResponse,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/**
 * 세션 참가 (인증 불필요)
 *
 * PIN 번호와 닉네임으로 세션에 참가합니다.
 */
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
 * 답변 제출 (Authorization 불필요, X-Participant-Id 헤더 사용)
 *
 * @param sessionId - 세션 ID
 * @param participantId - 참가자 ID (헤더로 전달)
 * @param request - 답변 제출 요청
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
      headers: {
        'X-Participant-Id': participantId,
      },
    },
  );
  return data;
}
