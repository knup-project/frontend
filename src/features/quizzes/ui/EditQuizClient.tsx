'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useQuiz, useUpdateQuiz } from '../hooks';
import { QuizForm } from './QuizForm';
import { getApiErrorMessage } from '@/shared/api/error';

export function EditQuizClient({ quizId }: { quizId: number }) {
  const router = useRouter();
  const { data: quiz, isLoading } = useQuiz(quizId);
  const { mutate: updateQuiz, isPending } = useUpdateQuiz();
  const [errorMsg, setErrorMsg] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: '#6a6a6a' }}>불러오는 중...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#c13515' }}>퀴즈를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quizzes" style={{ color: '#6a6a6a', fontSize: '14px' }}>
          ← 내 퀴즈
        </Link>
        <span style={{ color: '#dddddd' }}>/</span>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>퀴즈 편집</h1>
      </div>

      {errorMsg && (
        <p style={{ color: '#c13515', fontSize: '14px' }}>{errorMsg}</p>
      )}

      <QuizForm
        defaultValues={quiz}
        isPending={isPending}
        submitLabel="저장하기"
        onSubmit={(data) => {
          setErrorMsg('');
          updateQuiz(
            { quizId, request: data },
            {
              onSuccess: () => router.push('/dashboard/quizzes'),
              onError: (err) => setErrorMsg(getApiErrorMessage(err)),
            },
          );
        }}
      />
    </div>
  );
}
