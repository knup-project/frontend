'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateQuiz } from '../hooks';
import { QuizForm } from './QuizForm';
import { getApiErrorMessage } from '@/shared/api/error';
import { useState } from 'react';

export function NewQuizClient() {
  const router = useRouter();
  const { mutate: createQuiz, isPending } = useCreateQuiz();
  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quizzes" style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
          ← 내 퀴즈
        </Link>
        <span style={{ color: 'var(--color-hairline)' }}>/</span>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>새 퀴즈</h1>
      </div>

      {errorMsg && (
        <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>{errorMsg}</p>
      )}

      <QuizForm
        isPending={isPending}
        submitLabel="퀴즈 만들기"
        onSubmit={(data) => {
          setErrorMsg('');
          createQuiz(data, {
            onSuccess: () => router.push('/dashboard/quizzes'),
            onError: (err) => setErrorMsg(getApiErrorMessage(err)),
          });
        }}
      />
    </div>
  );
}
