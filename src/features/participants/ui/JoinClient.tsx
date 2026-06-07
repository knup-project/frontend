'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useJoinSession } from '../hooks';
import { transitions } from '@/shared/lib/motion';
import { Knupy } from '@/shared/ui/Knupy';

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
    <motion.div
      className="w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.base}
    >
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Knupy mood="idle" size={84} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--stage-text)' }}>
          퀴즈 참가
        </h1>
        <p style={{ color: 'var(--stage-muted)' }}>PIN 코드와 닉네임을 입력해 주세요</p>
      </div>

      {/* 카드 */}
      <div className="stage-card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* PIN 입력 — 대형 코드 */}
          <div>
            <label htmlFor="pin" className="block text-sm font-semibold mb-2" style={{ color: 'var(--stage-muted)' }}>
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
              placeholder="------"
              className="input-text text-center font-extrabold tabular"
              style={{ height: 72, fontSize: 40, letterSpacing: '0.22em' }}
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-semibold mb-2" style={{ color: 'var(--stage-muted)' }}>
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
            <p className="text-sm text-center u-shake" style={{ color: 'var(--color-primary-disabled)' }}>
              {errorMessage}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isPending || !pin.trim() || !nickname.trim()}
          >
            {isPending ? '참가 중…' : '참가하기'}
          </button>
        </form>
      </div>

      {/* 안내 */}
      <p className="text-center text-sm mt-6" style={{ color: 'var(--stage-muted)' }}>
        PIN 코드는 호스트에게 받으세요
      </p>
    </motion.div>
  );
}
