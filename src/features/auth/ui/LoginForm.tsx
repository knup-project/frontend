'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '../hooks';
import { getApiErrorMessage } from '@/shared/api/error';

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    login(
      { email, password },
      {
        onSuccess: () => router.push('/dashboard/quizzes'),
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      },
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1
          style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.18' }}
          className="mb-2"
        >
          로그인
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          KNU-P에 오신 것을 환영합니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 이메일 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="input-text"
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="input-text"
          />
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <p style={{ fontSize: '14px', color: 'var(--color-error)' }} role="alert">
            {errorMsg}
          </p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full mt-2"
        >
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* 회원가입 링크 */}
      <p
        className="mt-6 text-center"
        style={{ fontSize: '14px', color: 'var(--color-muted)' }}
      >
        계정이 없으신가요?{' '}
        <Link
          href="/signup"
          style={{ color: 'var(--color-primary)', fontWeight: 500 }}
          className="hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
