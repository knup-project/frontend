/**
 * 문제 결과 sessionStorage 헬퍼
 *
 * 흐름: PlayerQuestionClient → (제출 성공) → storeResult → /result 페이지
 *        PlayerResultClient → readStoredResult → 결과 표시 → clearStoredResult
 */

import type { AnswerResultResponse } from '@/shared/types/api';

const RESULT_STORAGE_KEY = 'knup-question-result';

/** 결과 + 어느 문제에 대한 결과인지 (결과 페이지의 다음 문제 폴백 판정용) */
export interface StoredResult {
  result: AnswerResultResponse;
  questionId: number;
}

/** 제출 결과를 sessionStorage에 저장합니다 */
export function storeResult(result: AnswerResultResponse, questionId: number): void {
  if (typeof window !== 'undefined') {
    const stored: StoredResult = { result, questionId };
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(stored));
  }
}

/** sessionStorage에서 결과를 읽습니다 (없으면 null) */
export function readStoredResult(): StoredResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredResult | AnswerResultResponse;
    // 구버전 형식(결과만 저장) 호환
    if ('result' in parsed) return parsed as StoredResult;
    return { result: parsed as AnswerResultResponse, questionId: -1 };
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
