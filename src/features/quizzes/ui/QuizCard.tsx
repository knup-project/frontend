'use client';

import Link from 'next/link';
import type { QuizResponse } from '@/shared/types/api';

interface QuizCardProps {
  quiz: QuizResponse;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function QuizCard({ quiz, onDelete, isDeleting }: QuizCardProps) {
  return (
    <div className="card-arcade card-arcade-interactive p-5 flex flex-col gap-3">
      {/* 제목 */}
      <div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {quiz.description}
          </p>
        )}
      </div>

      {/* 메타 */}
      <div className="flex items-center gap-2">
        <span className="chip">문제 {quiz.questionCount}개</span>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {new Date(quiz.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/host/sessions/new?quizId=${quiz.id}`}
          className="btn-primary text-sm"
          style={{ height: 36, padding: '0 16px', fontSize: 14 }}
        >
          세션 시작
        </Link>
        <Link
          href={`/dashboard/quizzes/${quiz.id}/edit`}
          className="btn-secondary text-sm"
          style={{ height: 36, padding: '0 16px', fontSize: 14 }}
        >
          편집
        </Link>
        <button
          onClick={() => onDelete(quiz.id)}
          disabled={isDeleting}
          style={{
            height: 36,
            padding: '0 12px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-muted)',
            background: 'none',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            opacity: isDeleting ? 0.5 : 1,
            marginLeft: 'auto',
          }}
          className="hover:opacity-70 transition-opacity"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
