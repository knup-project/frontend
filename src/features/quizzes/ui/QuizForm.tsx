'use client';

import { useRef, useState } from 'react';
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

/** 안정적인 key·아코디언 추적을 위한 클라이언트 전용 래퍼 */
interface Item {
  uid: string;
  q: QuestionCreateRequest;
}

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
 * - 문제 목록: 아코디언(접기/펼치기) — 문제가 많아도 한눈에, 한 번에 하나만 펼침
 * - 스티키 하단 바: 문제 수 + 추가/저장 (스크롤 위치와 무관하게 항상 접근)
 */
export function QuizForm({ defaultValues, onSubmit, isPending, submitLabel = '저장' }: QuizFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');

  const uidRef = useRef(0);
  const [items, setItems] = useState<Item[]>(() =>
    (defaultValues?.questions ?? [EMPTY_QUESTION()]).map((q) => ({ uid: `q${uidRef.current++}`, q })),
  );
  // 한 번에 하나만 펼침. 처음엔 첫 문제를 펼쳐 둔다.
  const [openUid, setOpenUid] = useState<string | null>(() => items[0]?.uid ?? null);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ title, description, questions: items.map((it) => it.q) });
  }

  const updateQuestion = (uid: string, partial: Partial<QuestionCreateRequest>) =>
    setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, q: { ...it.q, ...partial } } : it)));

  const updateOption = (uid: string, optIdx: number, value: string) =>
    setItems((prev) =>
      prev.map((it) => {
        if (it.uid !== uid) return it;
        const opts = [...(it.q.options ?? [])];
        opts[optIdx] = value;
        return { ...it, q: { ...it.q, options: opts } };
      }),
    );

  const addQuestion = () => {
    const uid = `q${uidRef.current++}`;
    setItems((prev) => [...prev, { uid, q: EMPTY_QUESTION() }]);
    setOpenUid(uid);
  };

  const removeQuestion = (uid: string) => {
    setItems((prev) => prev.filter((it) => it.uid !== uid));
    setOpenUid((cur) => (cur === uid ? null : cur));
  };

  const toggle = (uid: string) => setOpenUid((cur) => (cur === uid ? null : uid));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-28">
      {/* 기본 정보 */}
      <section className="card-arcade p-6 flex flex-col gap-4">
        <h2 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
          기본 정보
        </h2>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-muted)' }}>퀴즈 제목 *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="퀴즈 제목을 입력하세요"
            className="input-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-muted)' }}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="퀴즈 설명 (선택)"
            rows={3}
            style={{
              width: '100%',
              padding: '14px 12px',
              border: '1px solid var(--color-hairline)',
              borderRadius: 8,
              fontSize: 16,
              color: 'var(--color-ink)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </section>

      {/* 문제 목록 (아코디언) */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
          문제
        </h2>

        {items.map((it, idx) => (
          <QuestionEditor
            key={it.uid}
            index={idx}
            question={it.q}
            canRemove={items.length > 1}
            collapsed={openUid !== it.uid}
            onToggle={() => toggle(it.uid)}
            onChange={(partial) => updateQuestion(it.uid, partial)}
            onOptionChange={(oi, v) => updateOption(it.uid, oi, v)}
            onRemove={() => removeQuestion(it.uid)}
          />
        ))}

        {/* 점선 추가 버튼 */}
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 py-4 font-semibold hover:opacity-80 transition-opacity"
          style={{
            color: 'var(--color-primary)',
            border: '2px dashed var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> 문제 추가
        </button>
      </section>

      {/* 스티키 하단 바 */}
      <div className="sticky bottom-4 z-10">
        <div className="card-arcade flex items-center justify-between gap-3 p-3 pl-5">
          <span className="font-display text-lg shrink-0" style={{ color: 'var(--color-ink)' }}>
            문제 {items.length}개
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addQuestion}
              className="btn-secondary"
              style={{ height: 44, padding: '0 16px', fontSize: 14 }}
            >
              + 문제 추가
            </button>
            <button type="submit" disabled={isPending} className="btn-primary" style={{ height: 44 }}>
              {isPending ? '저장 중…' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
