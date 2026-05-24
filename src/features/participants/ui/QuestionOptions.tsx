'use client';

import type { QuestionType } from '@/shared/types/api';

// Kahoot 스타일 색상 / 도형
const OPTION_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const OPTION_SHAPES = ['▲', '◆', '●', '★'];

export interface QuestionOptionsProps {
  type: QuestionType;
  options?: string[];
  selectedAnswer: string | null;
  shortAnswer: string;
  onOptionClick: (answer: string) => void;
  onShortAnswerChange: (value: string) => void;
  onShortAnswerSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

/**
 * 문제 유형별 답변 선택 UI
 *
 * - MULTIPLE_CHOICE : 최대 4개의 색상 버튼
 * - TRUE_FALSE      : ⭕ / ❌ 두 버튼
 * - SHORT_ANSWER    : 텍스트 입력 + 제출 버튼
 */
export function QuestionOptions({
  type,
  options,
  selectedAnswer,
  shortAnswer,
  onOptionClick,
  onShortAnswerChange,
  onShortAnswerSubmit,
}: QuestionOptionsProps) {
  if (type === 'MULTIPLE_CHOICE' && options) {
    return (
      <div className="grid grid-cols-2 gap-3 h-full">
        {options.map((opt, idx) => {
          const color = OPTION_COLORS[idx % OPTION_COLORS.length];
          const shape = OPTION_SHAPES[idx % OPTION_SHAPES.length];
          const isSelected = selectedAnswer === opt;

          return (
            <button
              key={idx}
              onClick={() => onOptionClick(opt)}
              disabled={!!selectedAnswer}
              className="relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 font-semibold text-white transition-all"
              style={{
                backgroundColor: color,
                opacity: selectedAnswer && !isSelected ? 0.5 : 1,
                transform: isSelected ? 'scale(0.97)' : 'scale(1)',
                minHeight: 100,
              }}
            >
              <span className="text-2xl">{shape}</span>
              <span className="text-sm text-center leading-tight">{opt}</span>
              {isSelected && (
                <span className="absolute top-2 right-2 text-lg">✓</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (type === 'TRUE_FALSE') {
    return (
      <div className="grid grid-cols-2 gap-4 h-full max-h-52">
        {(['True', 'False'] as const).map((val, idx) => {
          const color = OPTION_COLORS[idx];
          const isSelected = selectedAnswer === val;
          return (
            <button
              key={val}
              onClick={() => onOptionClick(val)}
              disabled={!!selectedAnswer}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl font-bold text-white text-2xl transition-all"
              style={{
                backgroundColor: color,
                opacity: selectedAnswer && !isSelected ? 0.5 : 1,
                minHeight: 120,
              }}
            >
              <span className="text-4xl">{val === 'True' ? '⭕' : '❌'}</span>
              <span>{val}</span>
              {isSelected && <span className="text-lg">✓</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // SHORT_ANSWER
  return (
    <form onSubmit={onShortAnswerSubmit} className="flex flex-col gap-4 mt-4">
      <input
        type="text"
        value={shortAnswer}
        onChange={(e) => onShortAnswerChange(e.target.value)}
        placeholder="답을 입력하세요"
        disabled={!!selectedAnswer}
        className="input-text text-center text-lg"
        autoComplete="off"
        autoFocus
      />
      <button
        type="submit"
        disabled={!shortAnswer.trim() || !!selectedAnswer}
        className="btn-primary"
      >
        제출
      </button>
    </form>
  );
}
