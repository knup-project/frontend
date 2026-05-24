/**
 * 문제 결과 sessionStorage 헬퍼
 *
 * 흐름: PlayerQuestionClient → (제출 성공) → storeResult → /result 페이지
 *        PlayerResultClient → readStoredResult → 결과 표시 → clearStoredResult
 */

import type { AnswerResultResponse } from '@/shared/types/api';

const RESULT_STORAGE_KEY = 'knup-question-result';

/** 제출 결과를 sessionStorage에 저장합니다 */
export function storeResult(result: AnswerResultResponse): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  }
}

/** sessionStorage에서 결과를 읽습니다 (없으면 null) */
export function readStoredResult(): AnswerResultResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnswerResultResponse) : null;
  } catch {
    return null;
  }
}

/** sessionStorage에서 결과를 삭제합니다 */
export function clearStoredResult(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
  }
}
