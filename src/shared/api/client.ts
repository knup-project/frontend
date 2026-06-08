/**
 * src/shared/api/client.ts
 *
 * Axios 인스턴스 + 인터셉터 (세션 쿠키 기반 인증 / 401 처리)
 *
 * 인증 방식:
 *   서버(Spring HttpSession)가 발급한 세션 쿠키(JSESSIONID)를 사용합니다.
 *   쿠키는 httpOnly 이므로 JS 에서 접근할 수 없으며, withCredentials: true 일 때
 *   브라우저가 자동으로 요청에 첨부합니다.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
} from 'axios';

import { ENV } from '@/shared/constants/env';
import { useAuthStore } from '@/features/auth/store';

// ─────────────────────────────────────────────
// URL 판별 헬퍼
// ─────────────────────────────────────────────

const PUBLIC_URLS = [
  '/auth/signup',
  '/auth/login',
  '/sessions/join',
] as const;

/** 인증 불필요한 공개 URL */
function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_URLS.some((pub) => url.includes(pub));
}

/** answer URL: 세션 쿠키 대신 X-Participant-Id 헤더로 참가자를 식별 */
function isAnswerUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/answer/.test(url);
}

/** leaderboard URL: 인증 불필요 */
function isLeaderboardUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/leaderboard/.test(url);
}

/**
 * GET /sessions/{id} : 세션 상태 조회 — 참가자(미로그인)도 호출한다.
 * 401 이어도 /login 으로 보내지 않는다(참가자에겐 로그인 페이지가 무의미).
 * join·하위 경로(/start, /answer 등)는 제외.
 */
function isSessionDetailUrl(url: string | undefined, method: string | undefined): boolean {
  if (!url) return false;
  if (method && method.toLowerCase() !== 'get') return false;
  return /\/sessions\/[^/]+$/.test(url) && !url.includes('/sessions/join');
}

/**
 * 세션 복원(hydration) 조회 URL
 *
 * 401 이면 "로그아웃 상태"를 의미하므로 store 만 비우고
 * 강제 리다이렉트는 하지 않습니다. (보호 경로 이동은 AuthGuard 가 담당)
 */
function isMeUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('/auth/me');
}

// ─────────────────────────────────────────────
// Axios 인스턴스
// ─────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  // 세션 쿠키(JSESSIONID)를 모든 요청에 자동 첨부
  withCredentials: true,
});

// ─────────────────────────────────────────────
// Response 인터셉터: 인증 요청 401 처리
// ─────────────────────────────────────────────
//
// 세션 쿠키가 만료/무효이면 서버가 401 을 응답합니다.
// 토큰 재발급이 없으므로 auth store 를 비우고 /login 으로 이동합니다.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url;

    if (error.response?.status === 401) {
      // 세션 복원 조회(/auth/me)는 store 만 비우고 호출부가 처리하도록 둡니다.
      if (isMeUrl(url)) {
        useAuthStore.getState().clear();
        return Promise.reject(error);
      }

      // 공개·리더보드·answer 요청은 세션 인증 대상이 아니므로 그대로 전달
      const isAuthenticatedRequest =
        !isPublicUrl(url) &&
        !isLeaderboardUrl(url) &&
        !isAnswerUrl(url) &&
        !isSessionDetailUrl(url, error.config?.method);

      if (isAuthenticatedRequest) {
        useAuthStore.getState().clear();
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
      }
    }

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────
// 편의 헬퍼
// ─────────────────────────────────────────────

/** multipart/form-data 요청용 FormData 생성 */
export function createFormDataRequest(
  file: File,
  fields: Record<string, string>,
): FormData {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}
