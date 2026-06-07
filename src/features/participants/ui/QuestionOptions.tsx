'use client';

import type { QuestionType } from '@/shared/types/api';
import { motion } from 'motion/react';
import { choices } from '@/shared/constants/design';
import { staggerChildren, popIn } from '@/shared/lib/motion';

/**
 * 문제 유형별 답변 선택 UI
 *
 * - MULTIPLE_CHOICE : 최대 4개의 색상 버튼 (파/노/초/보라 — 레드 제외, 브랜드 전용)
 * - TRUE_FALSE      : ⭕ / ✕ 두 버튼
 * - SHORT_ANSWER    : 텍스트 입력 + 제출 버튼
 *
 * 접근성: 색만으로 구분하지 않도록 도형 글리프(▲●■◆)·체크 표시를 병행한다.
 */

// True/False — 색(파·노) + 글리프(⭕·✕)로 이중 구분
const TF_TOKENS = [
  { color: choices[0].color, glyph: '⭕' },
  { color: choices[1].color, glyph: '✕' },
] as const;

// 노란 버튼만 어두운 전경색(대비 확보), 나머지는 흰색
function foreground(key: string) {
  return key === 'yellow' ? '#2a2a2a' : '#ffffff';
}

export interface QuestionOptionsProps {
  type: QuestionType;
  options?: string[];
  selectedAnswer: string | null;
  shortAnswer: string;
  onOptionClick: (answer: string) => void;
  onShortAnswerChange: (value: string) => void;
  onShortAnswerSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

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
      <motion.div
        className="grid grid-cols-2 gap-3 h-full"
        variants={staggerChildren}
        initial="hidden"
        animate="show"
      >
        {options.map((opt, idx) => {
          const token = choices[idx % choices.length];
          const isSelected = selectedAnswer === opt;
          const dimmed = !!selectedAnswer && !isSelected;

          return (
            <motion.button
              key={idx}
              variants={popIn}
              onClick={() => onOptionClick(opt)}
              disabled={!!selectedAnswer}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 font-semibold transition-opacity"
              style={{
                backgroundColor: token.color,
                color: foreground(token.key),
                opacity: dimmed ? 0.4 : 1,
                outline: isSelected ? '3px solid #fff' : 'none',
                outlineOffset: '-3px',
                boxShadow: isSelected ? '0 0 0 4px rgba(255,255,255,0.25)' : 'none',
                minHeight: 104,
              }}
            >
              <span className="text-3xl" aria-hidden>
                {token.glyph}
              </span>
              <span className="text-sm text-center leading-tight">{opt}</span>
              {isSelected && (
                <span className="absolute top-2 right-2 text-lg" aria-hidden>
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  if (type === 'TRUE_FALSE') {
    return (
      <motion.div
        className="grid grid-cols-2 gap-4 h-full max-h-52"
        variants={staggerChildren}
        initial="hidden"
        animate="show"
      >
        {(['True', 'False'] as const).map((val, idx) => {
          const token = TF_TOKENS[idx];
          const isSelected = selectedAnswer === val;
          const dimmed = !!selectedAnswer && !isSelected;

          return (
            <motion.button
              key={val}
              variants={popIn}
              onClick={() => onOptionClick(val)}
              disabled={!!selectedAnswer}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl font-bold text-2xl"
              style={{
                backgroundColor: token.color,
                color: idx === 1 ? '#2a2a2a' : '#fff',
                opacity: dimmed ? 0.4 : 1,
                outline: isSelected ? '3px solid #fff' : 'none',
                outlineOffset: '-3px',
                minHeight: 120,
              }}
            >
              <span className="text-5xl" aria-hidden>
                {token.glyph}
              </span>
              <span>{val}</span>
              {isSelected && (
                <span className="text-lg" aria-hidden>
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
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
      <button type="submit" disabled={!shortAnswer.trim() || !!selectedAnswer} className="btn-primary">
        제출
      </button>
    </form>
  );
}
