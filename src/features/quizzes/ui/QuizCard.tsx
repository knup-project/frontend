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
    <div className="card p-5 flex flex-col gap-3 hover:shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px] transition-shadow duration-200">
      {/* 제목 */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#222222' }}>
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="mt-1" style={{ fontSize: '14px', color: '#6a6a6a' }}>
            {quiz.description}
          </p>
        )}
      </div>

      {/* 메타 */}
      <div className="flex items-center gap-3" style={{ fontSize: '14px', color: '#6a6a6a' }}>
        <span>문제 {quiz.questionCount}개</span>
        <span>·</span>
        <span>{new Date(quiz.createdAt).toLocaleDateString('ko-KR')}</span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 pt-1">
        {/* 세션 시작 */}
        <Link
          href={`/host/sessions/new?quizId=${quiz.id}`}
          className="btn-primary text-sm"
          style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}
        >
          세션 시작
        </Link>

        {/* 편집 */}
        <Link
          href={`/dashboard/quizzes/${quiz.id}/edit`}
          className="btn-secondary text-sm"
          style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}
        >
          편집
        </Link>

        {/* 삭제 */}
        <button
          onClick={() => onDelete(quiz.id)}
          disabled={isDeleting}
          style={{
            height: '36px',
            padding: '0 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#c13515',
            background: 'none',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            opacity: isDeleting ? 0.5 : 1,
          }}
          className="hover:underline"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
