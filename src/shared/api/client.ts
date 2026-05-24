/**
 * src/shared/api/client.ts
 *
 * Axios 인스턴스 + 인터셉터 (토큰 자동 첨부 / 401 재발급 / 재시도)
 *
 * 보안 참고사항:
 *   현재 accessToken / refreshToken은 localStorage에 저장됩니다.
 *   프로덕션에서는 XSS 공격 위험을 줄이기 위해
 *   httpOnly cookie 기반 저장을 권장합니다.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { ENV } from '@/shared/constants/env';
import {
  clearStoredTokens,
  getStoredTokens,
  updateStoredTokens,
} from './token';

// ─────────────────────────────────────────────
// URL 판별 헬퍼
// ─────────────────────────────────────────────

const PUBLIC_URLS = [
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/sessions/join',
] as const;

/** 인증 헤더 불필요한 공개 URL */
function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_URLS.some((pub) => url.includes(pub));
}

/** answer URL: Authorization 대신 X-Participant-Id 헤더 사용 */
function isAnswerUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/answer/.test(url);
}

/** leaderboard URL: 인증 불필요 */
function isLeaderboardUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/leaderboard/.test(url);
}

// ─────────────────────────────────────────────
// Axios 인스턴스
// ─────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─────────────────────────────────────────────
// Request 인터셉터: 토큰 자동 첨부
// ─────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url;

    if (isPublicUrl(url) || isLeaderboardUrl(url) || isAnswerUrl(url)) {
      return config;
    }

    const { accessToken } = getStoredTokens();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────
// 401 재발급 큐 (중복 refresh 방지)
// ─────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function enqueueRefresh(cb: (token: string) => void): void {
  refreshQueue.push(cb);
}

function flushRefreshQueue(token: string): void {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// ─────────────────────────────────────────────
// Response 인터셉터: 401 처리 + refresh 재시도
// ─────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // refresh 엔드포인트 자체가 401이면 → 로그아웃
    if (isPublicUrl(originalRequest.url)) {
      clearStoredTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        enqueueRefresh((newToken) => {
          const headers = originalRequest.headers as Record<string, string> ?? {};
          headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers = headers;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/refresh', { refreshToken });

      updateStoredTokens(data);
      flushRefreshQueue(data.accessToken);
      isRefreshing = false;

      const headers = originalRequest.headers as Record<string, string> ?? {};
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      originalRequest.headers = headers;

      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshQueue = [];
      clearStoredTokens();
      return Promise.reject(refreshError);
    }
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
