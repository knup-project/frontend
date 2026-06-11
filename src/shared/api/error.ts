import type { ErrorResponse } from '@/shared/types/api';

// ─────────────────────────────────────────────
// 에러 코드 → 사용자 친화적 한글 메시지 매핑
// ─────────────────────────────────────────────

const ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_REQUEST: '요청 값이 올바르지 않습니다.',
  TIME_EXPIRED: '제한 시간이 초과되었습니다.',
  ALREADY_SUBMITTED: '이미 답변을 제출했습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  QUIZ_NOT_FOUND: '퀴즈를 찾을 수 없습니다.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없습니다.',
  INVALID_PIN: 'PIN 번호가 올바르지 않습니다.',
  EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다.',
  NICKNAME_DUPLICATE: '이미 사용 중인 닉네임입니다.',
  SESSION_FULL: '세션 참가자 수가 초과되었습니다.',
  SESSION_ALREADY_STARTED: '이미 시작된 세션입니다.',
  AI_RATE_LIMITED: 'AI 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  AI_SERVICE_ERROR: 'AI 서비스에 일시적인 오류가 발생했습니다.',
  PDF_TOO_LARGE: 'PDF 파일이 너무 큽니다. 15MB 이하의 파일을 올려 주세요.',
};

// ─────────────────────────────────────────────
// Type Guard
// ─────────────────────────────────────────────

export function isApiError(error: unknown): error is ErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error &&
    'timestamp' in error &&
    'path' in error
  );
}

// ─────────────────────────────────────────────
// 에러 코드 추출
// ─────────────────────────────────────────────

/** 서버 ErrorResponse 의 code 를 꺼냅니다 (없으면 null) */
export function getApiErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: unknown } };
    const data = axiosError.response?.data;
    if (isApiError(data)) return data.code;
  }
  if (isApiError(error)) return error.code;
  return null;
}

// ─────────────────────────────────────────────
// 에러 메시지 추출
// ─────────────────────────────────────────────

export function getApiErrorMessage(error: unknown): string {
  // axios error with response data
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as { response?: { data?: unknown } };
    const data = axiosError.response?.data;
    if (isApiError(data)) {
      return ERROR_CODE_MESSAGES[data.code] ?? data.message;
    }
  }

  // plain ErrorResponse
  if (isApiError(error)) {
    return ERROR_CODE_MESSAGES[error.code] ?? error.message;
  }

  // Error instance
  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}
