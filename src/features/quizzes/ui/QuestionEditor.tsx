'use client';

import type { QuestionCreateRequest, QuestionType } from '@/shared/types/api';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: '객관식' },
  { value: 'TRUE_FALSE', label: 'O/X' },
  { value: 'SHORT_ANSWER', label: '단답형' },
];

const TYPE_LABEL: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: '객관식',
  TRUE_FALSE: 'O/X',
  SHORT_ANSWER: '단답형',
};

interface QuestionEditorProps {
  index: number;
  question: QuestionCreateRequest;
  canRemove: boolean;
  /** 접힘 여부 (아코디언) */
  collapsed: boolean;
  onToggle: () => void;
  onChange: (partial: Partial<QuestionCreateRequest>) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
  onRemove: () => void;
}

/**
 * 단일 문제 편집기 (아코디언)
 *
 * - 접힌 상태: 번호 + 유형 + 내용 미리보기만 표시 → 문제가 많아도 한눈에
 * - 펼친 상태: 유형/내용/보기/정답/시간/점수 편집
 */
export function QuestionEditor({
  index,
  question,
  canRemove,
  collapsed,
  onToggle,
  onChange,
  onOptionChange,
  onRemove,
}: QuestionEditorProps) {
  function handleTypeChange(type: QuestionType) {
    const defaults: Partial<QuestionCreateRequest> = { type, answer: '' };
    if (type === 'MULTIPLE_CHOICE') defaults.options = ['', '', '', ''];
    else if (type === 'TRUE_FALSE') defaults.options = ['O', 'X'];
    else defaults.options = undefined;
    onChange(defaults);
  }

  return (
    <div className="card-arcade overflow-hidden">
      {/* 헤더 — 클릭으로 접기/펼치기 */}
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span
            className="font-display flex items-center justify-center shrink-0"
            style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-primary)', color: '#fff', fontSize: 16 }}
          >
            {index + 1}
          </span>
          <span className="flex items-center gap-2 min-w-0">
            <span className="chip shrink-0">{TYPE_LABEL[question.type]}</span>
            <span className="text-sm truncate" style={{ color: question.content ? 'var(--color-ink)' : 'var(--color-muted-soft)' }}>
              {question.content || '문제를 입력하세요'}
            </span>
          </span>
        </button>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 hover:opacity-70 transition-opacity"
            style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}
          >
            삭제
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? '펼치기' : '접기'}
          className="shrink-0"
          style={{ color: 'var(--color-muted)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 150ms ease' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* 본문 — 펼침 */}
      {!collapsed && (
        <div className="px-4 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
          {/* 유형 선택 */}
          <div className="flex gap-2">
            {QUESTION_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleTypeChange(value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: question.type === value ? 'none' : '1px solid var(--color-hairline)',
                  background: question.type === value ? 'var(--color-primary)' : 'white',
                  color: question.type === value ? 'white' : 'var(--color-muted)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 문제 내용 */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>문제 *</label>
            <input
              required
              value={question.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="문제를 입력하세요"
              className="input-text"
            />
          </div>

          {/* 보기 (객관식) */}
          {question.type === 'MULTIPLE_CHOICE' && (
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>보기</label>
              {(question.options ?? []).map((opt, oi) => (
                <input
                  key={oi}
                  value={opt}
                  onChange={(e) => onOptionChange(oi, e.target.value)}
                  placeholder={`보기 ${oi + 1}`}
                  className="input-text"
                  style={{ height: '44px' }}
                />
              ))}
            </div>
          )}

          {/* 정답 */}
          <AnswerInput question={question} onChange={onChange} />

          {/* 제한 시간 / 점수 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>제한 시간(초)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={question.timeLimit}
                onChange={(e) => onChange({ timeLimit: Number(e.target.value) })}
                className="input-text"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>점수</label>
              <input
                type="number"
                min={0}
                value={question.points}
                onChange={(e) => onChange({ points: Number(e.target.value) })}
                className="input-text"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 정답 입력 (유형별 분기)
// ─────────────────────────────────────────────

function AnswerInput({
  question,
  onChange,
}: {
  question: QuestionCreateRequest;
  onChange: (partial: Partial<QuestionCreateRequest>) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-muted)' }}>정답 *</label>

      {question.type === 'TRUE_FALSE' ? (
        <div className="flex gap-2">
          {['O', 'X'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ answer: v })}
              style={{
                width: '64px',
                height: '44px',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: 700,
                border: question.answer === v ? 'none' : '1px solid var(--color-hairline)',
                background: question.answer === v ? 'var(--color-primary)' : 'white',
                color: question.answer === v ? 'white' : 'var(--color-ink)',
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
          value={question.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          placeholder={question.type === 'MULTIPLE_CHOICE' ? '예: 1 (보기 번호)' : '정답을 입력하세요'}
          className="input-text"
        />
      )}
    </div>
  );
}
