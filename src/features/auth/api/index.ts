import { apiClient } from '@/shared/api/client';
import type { AuthResponse, LoginRequest, SignUpRequest } from '@/shared/types/api';

/**
 * 회원가입
 *
 * 성공 시 서버가 Set-Cookie 로 세션 쿠키를 발급합니다.
 */
export async function signUp(request: SignUpRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', request);
  return data;
}

/**
 * 로그인
 *
 * 성공 시 서버가 Set-Cookie 로 세션 쿠키를 발급합니다.
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', request);
  return data;
}

/**
 * 현재 로그인 사용자 조회
 *
 * 세션 쿠키가 유효하면 200 + AuthResponse, 아니면 401.
 * 앱 로드 시 인증 상태 복원(hydration)에 사용합니다.
 */
export async function me(): Promise<AuthResponse> {
  const { data } = await apiClient.get<AuthResponse>('/auth/me');
  return data;
}

/**
 * 로그아웃
 *
 * 서버 세션을 무효화합니다. (204 No Content)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
