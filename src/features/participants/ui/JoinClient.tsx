'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinSession } from '../hooks';

export default function JoinClient() {
  const router = useRouter();
  const { mutate: join, isPending, error } = useJoinSession();

  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');

  const errorMessage =
    error instanceof Error ? error.message : error ? '참가에 실패했습니다.' : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;

    join(
      { pin: pin.trim(), nickname: nickname.trim() },
      {
        onSuccess: (response) => {
          router.push(`/play/${response.sessionId}/waiting`);
        },
      },
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: 28 }}
        >
          🎮
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--color-ink)' }}
        >
          퀴즈 참가
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>PIN 코드와 닉네임을 입력해 주세요</p>
      </div>

      {/* 카드 */}
      <div
        className="card p-8"
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* PIN 입력 */}
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-ink)' }}
            >
              게임 PIN
            </label>
            <input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9A-Za-z]*"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              placeholder="PIN 코드 입력"
              className="input-text text-center text-2xl font-bold tracking-widest"
              style={{ letterSpacing: '0.2em' }}
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-ink)' }}
            >
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="나를 표현할 닉네임"
              className="input-text"
              autoComplete="off"
            />
          </div>

          {/* 에러 */}
          {errorMessage && (
            <p
              className="text-sm text-center"
              style={{ color: 'var(--color-error)' }}
            >
              {errorMessage}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isPending || !pin.trim() || !nickname.trim()}
          >
            {isPending ? '참가 중...' : '참가하기'}
          </button>
        </form>
      </div>

      {/* 안내 */}
      <p
        className="text-center text-sm mt-6"
        style={{ color: 'var(--color-muted)' }}
      >
        PIN 코드는 호스트에게 받으세요
      </p>
    </div>
  );
}
