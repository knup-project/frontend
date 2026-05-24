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

// ─────────────────────────────────────────────
// 인증 없이 호출 가능한 URL 패턴
// ─────────────────────────────────────────────

const PUBLIC_URLS = [
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/sessions/join',
] as const;

/** URL이 공개 API인지 확인 */
function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_URLS.some((pub) => url.includes(pub));
}

/**
 * sessionId/answer 패턴: Authorization 대신 X-Participant-Id 헤더 사용
 * 예: /sessions/abc123/answer
 */
function isAnswerUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/answer/.test(url);
}

// ─────────────────────────────────────────────
// Leaderboard URL (인증 불필요)
// ─────────────────────────────────────────────

function isLeaderboardUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/sessions\/[^/]+\/leaderboard/.test(url);
}

// ─────────────────────────────────────────────
// localStorage 토큰 헬퍼 (store 순환 참조 방지)
// ─────────────────────────────────────────────

const TOKEN_STORAGE_KEY = 'knup-auth';

function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string; refreshToken?: string };
    };
    return {
      accessToken: parsed.state?.accessToken ?? null,
      refreshToken: parsed.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function clearStoredTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
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

    // 공개 URL은 Authorization 헤더 불필요
    if (isPublicUrl(url) || isLeaderboardUrl(url)) {
      return config;
    }

    // answer URL: X-Participant-Id 헤더는 각 API 함수에서 직접 주입 (여기서는 skip)
    if (isAnswerUrl(url)) {
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
// 401 재발급 큐 패턴 (중복 refresh 방지)
// ─────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
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
      // 이미 재발급 중: 완료될 때까지 대기
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>)[
              'Authorization'
            ] = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
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

      // 새 토큰을 localStorage에 반영 (Zustand store는 상태를 읽을 뿐)
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { state?: object };
            parsed.state = {
              ...(parsed.state ?? {}),
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn,
              isAuthenticated: true,
            };
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
      }

      onRefreshed(data.accessToken);
      isRefreshing = false;

      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>)[
          'Authorization'
        ] = `Bearer ${data.accessToken}`;
      } else {
        originalRequest.headers = {
          Authorization: `Bearer ${data.accessToken}`,
        };
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];
      clearStoredTokens();
      return Promise.reject(refreshError);
    }
  },
);

// ─────────────────────────────────────────────
// 편의 헬퍼 (multipart/form-data 포함)
// ─────────────────────────────────────────────

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
