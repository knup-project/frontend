import { apiClient } from '@/shared/api/client';
import type { LoginRequest, SignUpRequest, TokenResponse } from '@/shared/types/api';

/**
 * 회원가입
 */
export async function signUp(request: SignUpRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/signup', request);
  return data;
}

/**
 * 로그인
 */
export async function login(request: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/login', request);
  return data;
}

/**
 * 토큰 갱신
 */
export async function refreshToken(token: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}
