'use client';

import { useState } from 'react';
import { QuestionEditor } from './QuestionEditor';
import type { QuizCreateRequest, QuestionCreateRequest } from '@/shared/types/api';

const EMPTY_QUESTION = (): QuestionCreateRequest => ({
  content: '',
  type: 'MULTIPLE_CHOICE',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  timeLimit: 30,
  points: 100,
});

interface QuizFormProps {
  defaultValues?: Partial<QuizCreateRequest>;
  onSubmit: (data: QuizCreateRequest) => void;
  isPending: boolean;
  submitLabel?: string;
}

/**
 * 퀴즈 생성 / 수정 폼
 *
 * - 기본 정보 (제목, 설명)
 * - 문제 목록 (QuestionEditor × N)
 */
export function QuizForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = '저장',
}: QuizFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [questions, setQuestions] = useState<QuestionCreateRequest[]>(
    defaultValues?.questions ?? [EMPTY_QUESTION()],
  );

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ title, description, questions });
  }

  function updateQuestion(idx: number, partial: Partial<QuestionCreateRequest>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...partial } : q)),
    );
  }

  function updateOption(qIdx: number, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...(q.options ?? [])];
        opts[optIdx] = value;
        return { ...q, options: opts };
      }),
    );
  }

  const addQuestion = () => setQuestions((prev) => [...prev, EMPTY_QUESTION()]);
  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* 기본 정보 */}
      <section className="bg-canvas rounded-md border border-hairline p-6 flex flex-col gap-4">
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>기본 정보</h2>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>
            퀴즈 제목 *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="퀴즈 제목을 입력하세요"
            className="input-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="퀴즈 설명 (선택)"
            rows={3}
            style={{
              width: '100%',
              padding: '14px 12px',
              border: '1px solid var(--color-hairline)',
              borderRadius: '8px',
              fontSize: '16px',
              color: 'var(--color-ink)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </section>

      {/* 문제 목록 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>
            문제 ({questions.length}개)
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="btn-secondary"
            style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}
          >
            + 문제 추가
          </button>
        </div>

        {questions.map((q, idx) => (
          <QuestionEditor
            key={idx}
            index={idx}
            question={q}
            canRemove={questions.length > 1}
            onChange={(partial) => updateQuestion(idx, partial)}
            onOptionChange={(optIdx, value) => updateOption(idx, optIdx, value)}
            onRemove={() => removeQuestion(idx)}
          />
        ))}
      </section>

      {/* 제출 */}
      <div className="flex justify-end gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
