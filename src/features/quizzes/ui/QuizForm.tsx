'use client';

import { useState } from 'react';
import type { QuizCreateRequest, QuestionCreateRequest, QuestionType } from '@/shared/types/api';

interface QuizFormProps {
  defaultValues?: Partial<QuizCreateRequest>;
  onSubmit: (data: QuizCreateRequest) => void;
  isPending: boolean;
  submitLabel?: string;
}

const EMPTY_QUESTION = (): QuestionCreateRequest => ({
  content: '',
  type: 'MULTIPLE_CHOICE',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  timeLimit: 30,
  points: 100,
});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, questions });
  };

  const updateQuestion = (idx: number, partial: Partial<QuestionCreateRequest>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...partial } : q)),
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...(q.options ?? [])];
        opts[optIdx] = value;
        return { ...q, options: opts };
      }),
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, EMPTY_QUESTION()]);
  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* 기본 정보 */}
      <section className="bg-white rounded-[14px] border border-[#dddddd] p-6 flex flex-col gap-4">
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>기본 정보</h2>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
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
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="퀴즈 설명 (선택)"
            rows={3}
            style={{
              width: '100%',
              padding: '14px 12px',
              border: '1px solid #dddddd',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#222222',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </section>

      {/* 문제 목록 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>
            문제 ({questions.length}개)
          </h2>
          <button type="button" onClick={addQuestion} className="btn-secondary"
            style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}>
            + 문제 추가
          </button>
        </div>

        {questions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[14px] border border-[#dddddd] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#222222' }}>
                문제 {idx + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  style={{ fontSize: '13px', color: '#c13515' }}
                  className="hover:underline"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 유형 */}
            <div className="flex gap-2">
              {(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] as QuestionType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateQuestion(idx, { type, options: type === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : type === 'TRUE_FALSE' ? ['O', 'X'] : undefined })}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: q.type === type ? 'none' : '1px solid #dddddd',
                      background: q.type === type ? '#ff385c' : 'white',
                      color: q.type === type ? 'white' : '#6a6a6a',
                      cursor: 'pointer',
                    }}
                  >
                    {type === 'MULTIPLE_CHOICE' ? '객관식' : type === 'TRUE_FALSE' ? 'O/X' : '단답형'}
                  </button>
                ),
              )}
            </div>

            {/* 문제 내용 */}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>문제 *</label>
              <input
                required
                value={q.content}
                onChange={(e) => updateQuestion(idx, { content: e.target.value })}
                placeholder="문제를 입력하세요"
                className="input-text"
              />
            </div>

            {/* 보기 (객관식) */}
            {q.type === 'MULTIPLE_CHOICE' && (
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>보기</label>
                {(q.options ?? []).map((opt, oi) => (
                  <input
                    key={oi}
                    value={opt}
                    onChange={(e) => updateOption(idx, oi, e.target.value)}
                    placeholder={`보기 ${oi + 1}`}
                    className="input-text"
                    style={{ height: '44px' }}
                  />
                ))}
              </div>
            )}

            {/* 정답 */}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>정답 *</label>
              {q.type === 'TRUE_FALSE' ? (
                <div className="flex gap-2">
                  {['O', 'X'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateQuestion(idx, { answer: v })}
                      style={{
                        width: '64px', height: '44px',
                        borderRadius: '8px',
                        fontSize: '20px', fontWeight: 700,
                        border: q.answer === v ? 'none' : '1px solid #dddddd',
                        background: q.answer === v ? '#ff385c' : 'white',
                        color: q.answer === v ? 'white' : '#222222',
                        cursor: 'pointer',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  required
                  value={q.answer}
                  onChange={(e) => updateQuestion(idx, { answer: e.target.value })}
                  placeholder={q.type === 'MULTIPLE_CHOICE' ? '예: 1 (보기 번호)' : '정답을 입력하세요'}
                  className="input-text"
                />
              )}
            </div>

            {/* 시간/점수 */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>제한 시간(초)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={q.timeLimit}
                  onChange={(e) => updateQuestion(idx, { timeLimit: Number(e.target.value) })}
                  className="input-text"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>점수</label>
                <input
                  type="number"
                  min={0}
                  value={q.points}
                  onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                  className="input-text"
                />
              </div>
            </div>
          </div>
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
