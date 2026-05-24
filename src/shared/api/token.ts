/**
 * localStorage 토큰 헬퍼
 *
 * Zustand store와의 순환 참조를 피하기 위해
 * localStorage를 직접 읽고 씁니다.
 *
 * 저장 구조: { state: { accessToken, refreshToken, expiresIn, isAuthenticated } }
 */

export const TOKEN_STORAGE_KEY = 'knup-auth';

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/** localStorage에서 토큰을 읽습니다 */
export function getStoredTokens(): StoredTokens {
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

/** localStorage에서 토큰을 삭제합니다 (로그아웃·갱신 실패 시) */
export function clearStoredTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * 갱신된 토큰을 localStorage에 반영합니다.
 * Zustand store는 persist 미들웨어로 읽기 전용이므로
 * 직접 쓰기가 필요합니다.
 */
export function updateStoredTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: object };
    parsed.state = {
      ...(parsed.state ?? {}),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      isAuthenticated: true,
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // 파싱 실패는 무시
  }
}
