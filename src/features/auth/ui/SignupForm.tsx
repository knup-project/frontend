'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp } from '../hooks';
import { getApiErrorMessage } from '@/shared/api/error';

export function SignupForm() {
  const router = useRouter();
  const { mutate: signUp, isPending } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    signUp(
      { email, password, nickname },
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
          회원가입
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          퀴즈 호스트 계정을 만들어보세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="사용할 닉네임"
            className="input-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>
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

        <div className="flex flex-col gap-1">
          <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            className="input-text"
          />
        </div>

        {errorMsg && (
          <p style={{ fontSize: '14px', color: 'var(--color-error)' }} role="alert">
            {errorMsg}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
          {isPending ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="mt-6 text-center" style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
        이미 계정이 있으신가요?{' '}
        <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }} className="hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
