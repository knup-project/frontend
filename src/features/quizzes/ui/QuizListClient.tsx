'use client';

import Link from 'next/link';
import { useMyQuizzes, useDeleteQuiz } from '../hooks';
import { QuizCard } from './QuizCard';

export function QuizListClient() {
  const { data, isLoading, isError } = useMyQuizzes({ size: 20 });
  const { mutate: deleteQuiz, isPending: isDeleting } = useDeleteQuiz();

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#222222' }}>내 퀴즈</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/ai-generate"
            className="btn-secondary"
            style={{ height: '40px', padding: '0 16px', fontSize: '14px' }}
          >
            AI로 만들기
          </Link>
          <Link
            href="/dashboard/quizzes/new"
            className="btn-primary"
            style={{ height: '40px', padding: '0 16px', fontSize: '14px' }}
          >
            + 새 퀴즈
          </Link>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span style={{ color: '#6a6a6a' }}>불러오는 중...</span>
        </div>
      )}

      {/* 에러 */}
      {isError && (
        <div className="text-center py-16">
          <p style={{ color: '#c13515' }}>퀴즈 목록을 불러오지 못했습니다.</p>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && data?.content.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>
            아직 퀴즈가 없어요
          </p>
          <p style={{ fontSize: '14px', color: '#6a6a6a' }}>
            새 퀴즈를 만들거나 AI로 자동 생성해보세요.
          </p>
          <Link href="/dashboard/quizzes/new" className="btn-primary mt-2">
            첫 번째 퀴즈 만들기
          </Link>
        </div>
      )}

      {/* 퀴즈 목록 */}
      {data && data.content.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.content.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={(id) => deleteQuiz(id)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
