'use client';

import Link from 'next/link';
import { useMyQuizzes, useDeleteQuiz } from '../hooks';
import { QuizCard } from './QuizCard';
import { Knupy } from '@/shared/ui/Knupy';

export function QuizListClient() {
  const { data, isLoading, isError } = useMyQuizzes({ size: 20 });
  const { mutate: deleteQuiz, isPending: isDeleting } = useDeleteQuiz();

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-ink)' }}>
            내 퀴즈 서재
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            만든 퀴즈로 바로 세션을 열 수 있어요
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href="/dashboard/ai-generate"
            className="btn-secondary"
            style={{ height: 40, padding: '0 16px', fontSize: 14 }}
          >
            AI로 만들기
          </Link>
          <Link
            href="/dashboard/quizzes/new"
            className="btn-primary"
            style={{ height: 40, padding: '0 16px', fontSize: 14 }}
          >
            + 새 퀴즈
          </Link>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span style={{ color: 'var(--color-muted)' }}>불러오는 중…</span>
        </div>
      )}

      {/* 에러 */}
      {isError && (
        <div className="text-center py-16">
          <p style={{ color: 'var(--color-error)' }}>퀴즈 목록을 불러오지 못했습니다.</p>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && data?.content.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Knupy mood="idle" size={88} float={false} />
          <p className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
            아직 퀴즈가 없어요
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
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
            <QuizCard key={quiz.id} quiz={quiz} onDelete={(id) => deleteQuiz(id)} isDeleting={isDeleting} />
          ))}
        </div>
      )}
    </div>
  );
}
