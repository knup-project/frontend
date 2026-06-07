'use client';

import type { QuestionCreateRequest, QuestionType } from '@/shared/types/api';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: '객관식' },
  { value: 'TRUE_FALSE', label: 'O/X' },
  { value: 'SHORT_ANSWER', label: '단답형' },
];

interface QuestionEditorProps {
  index: number;
  question: QuestionCreateRequest;
  canRemove: boolean;
  onChange: (partial: Partial<QuestionCreateRequest>) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
  onRemove: () => void;
}

/**
 * 단일 문제 편집기
 *
 * QuizForm 에서 문제 목록을 렌더링할 때 각 항목에 사용됩니다.
 * - 문제 유형 선택 (객관식 / O/X / 단답형)
 * - 문제 내용 입력
 * - 보기 입력 (객관식)
 * - 정답 입력 (O/X 는 버튼, 나머지는 텍스트)
 * - 제한 시간 / 점수
 */
export function QuestionEditor({
  index,
  question,
  canRemove,
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
    <div className="bg-white rounded-[14px] border border-[#dddddd] p-6 flex flex-col gap-4">
      {/* 헤더: 문제 번호 + 삭제 */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#222222' }}>
          문제 {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{ fontSize: '13px', color: '#c13515' }}
            className="hover:underline"
          >
            삭제
          </button>
        )}
      </div>

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
              border: question.type === value ? 'none' : '1px solid #dddddd',
              background: question.type === value ? 'var(--color-primary)' : 'white',
              color: question.type === value ? 'white' : '#6a6a6a',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 문제 내용 */}
      <div className="flex flex-col gap-1">
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>문제 *</label>
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
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>보기</label>
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
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
            제한 시간(초)
          </label>
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
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>점수</label>
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
      <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>정답 *</label>

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
                border: question.answer === v ? 'none' : '1px solid #dddddd',
                background: question.answer === v ? 'var(--color-primary)' : 'white',
                color: question.answer === v ? 'white' : '#222222',
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
          placeholder={
            question.type === 'MULTIPLE_CHOICE' ? '예: 1 (보기 번호)' : '정답을 입력하세요'
          }
          className="input-text"
        />
      )}
    </div>
  );
}
