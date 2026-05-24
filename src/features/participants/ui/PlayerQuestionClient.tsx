'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipantStore } from '../store';
import { useSubmitAnswer } from '../hooks';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import type {
  AnswerResultResponse,
  QuestionType,
  SessionQuestionEvent,
  SessionStatusEvent,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// sessionStorage 헬퍼 — result 페이지로 데이터 전달
// ─────────────────────────────────────────────

const RESULT_STORAGE_KEY = 'knup-question-result';

function storeResult(result: AnswerResultResponse) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  }
}

// ─────────────────────────────────────────────
// 답변 옵션 색상 (Kahoot 스타일)
// ─────────────────────────────────────────────

const OPTION_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const OPTION_SHAPES = ['▲', '◆', '●', '★'];

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

type Phase = 'waiting' | 'question' | 'submitted';

interface ActiveQuestion {
  event: SessionQuestionEvent;
  startedAt: number; // Date.now()
}

interface Props {
  sessionId: string;
}

export default function PlayerQuestionClient({ sessionId }: Props) {
  const router = useRouter();
  const { participantId } = useParticipantStore((s) => ({
    participantId: s.participantId,
  }));

  const [phase, setPhase] = useState<Phase>('waiting');
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

  // ── 타이머 ─────────────────────────────────

  useEffect(() => {
    if (phase !== 'question' || !activeQuestion) return;

    const elapsed = Math.floor((Date.now() - activeQuestion.startedAt) / 1000);
    const remaining = Math.max(activeQuestion.event.question.timeLimit - elapsed, 0);
    setTimeLeft(remaining);

    if (remaining === 0) {
      setPhase('submitted');
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setPhase('submitted');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);

  // ── WebSocket 콜백 ─────────────────────────

  const handleQuestion = useCallback((event: SessionQuestionEvent) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveQuestion({ event, startedAt: Date.now() });
    setSelectedAnswer(null);
    setShortAnswer('');
    setPhase('question');
  }, []);

  const handleStatus = useCallback(
    (event: SessionStatusEvent) => {
      if (event.status === 'FINISHED') {
        router.push(`/play/${sessionId}/leaderboard`);
      }
    },
    [router, sessionId],
  );

  useSessionSocket({
    sessionId,
    participantId,
    enabled: !!sessionId,
    onQuestion: handleQuestion,
    onStatus: handleStatus,
  });

  // ── 답변 제출 ──────────────────────────────

  function submitWithAnswer(answer: string) {
    if (!activeQuestion || isSubmitting) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelectedAnswer(answer);
    setPhase('submitted');

    const elapsed = Math.floor((Date.now() - activeQuestion.startedAt) / 1000);

    submitAnswer(
      {
        questionId: activeQuestion.event.question.id,
        answer,
        responseTimeSec: elapsed,
      },
      {
        onSuccess: (result: AnswerResultResponse) => {
          storeResult(result);
          router.push(`/play/${sessionId}/result`);
        },
        onError: () => {
          // 제출 실패해도 result 페이지로 이동 (빈 결과)
          router.push(`/play/${sessionId}/result`);
        },
      },
    );
  }

  function handleOptionClick(answer: string) {
    if (phase !== 'question' || selectedAnswer) return;
    submitWithAnswer(answer);
  }

  function handleShortAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shortAnswer.trim() || phase !== 'question') return;
    submitWithAnswer(shortAnswer.trim());
  }

  // ─────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────

  // 대기 화면
  if (phase === 'waiting') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">🎯</div>
          <h2 className="text-white text-2xl font-bold mb-2">다음 문제를 기다리는 중</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>호스트가 문제를 시작하면 나타납니다</p>
        </div>
      </div>
    );
  }

  // 제출 완료 화면 (결과 대기)
  if (phase === 'submitted') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-6">
            {selectedAnswer ? '✅' : '⏱️'}
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">
            {selectedAnswer ? '제출 완료!' : '시간 종료!'}
          </h2>
          {selectedAnswer && (
            <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-lg">
              선택한 답: <span className="font-semibold text-white">{selectedAnswer}</span>
            </p>
          )}
          <p style={{ color: 'rgba(255,255,255,0.5)' }} className="mt-2">
            결과를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // 문제 화면
  if (!activeQuestion) return null;

  const { question, questionIndex, totalQuestions } = activeQuestion.event;
  const timerPercent = (timeLeft / question.timeLimit) * 100;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* 헤더: 문제 번호 + 타이머 */}
      <div className="px-6 pt-6 pb-4">
        {/* 진행률 바 */}
        <div
          className="w-full h-2 rounded-full mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${timerPercent}%`,
              backgroundColor:
                timerPercent > 50
                  ? 'var(--color-primary)'
                  : timerPercent > 20
                  ? '#f59e0b'
                  : '#ef4444',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {questionIndex + 1} / {totalQuestions}
          </span>
          {/* 타이머 */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg"
            style={{
              backgroundColor:
                timeLeft <= 5 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
              color: timeLeft <= 5 ? '#fca5a5' : 'white',
            }}
          >
            ⏱ {timeLeft}
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {question.points}점
          </span>
        </div>
      </div>

      {/* 문제 */}
      <div className="px-6 py-4 flex-shrink-0">
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-white text-xl font-bold leading-relaxed">
            {question.content}
          </p>
        </div>
      </div>

      {/* 답변 영역 */}
      <div className="flex-1 px-4 pb-6">
        <QuestionOptions
          type={question.type}
          options={question.options}
          shortAnswer={shortAnswer}
          onShortAnswerChange={setShortAnswer}
          onOptionClick={handleOptionClick}
          onShortAnswerSubmit={handleShortAnswerSubmit}
          selectedAnswer={selectedAnswer}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 답변 옵션 서브컴포넌트
// ─────────────────────────────────────────────

interface QuestionOptionsProps {
  type: QuestionType;
  options?: string[];
  shortAnswer: string;
  onShortAnswerChange: (v: string) => void;
  onOptionClick: (answer: string) => void;
  onShortAnswerSubmit: (e: React.FormEvent) => void;
  selectedAnswer: string | null;
}

function QuestionOptions({
  type,
  options,
  shortAnswer,
  onShortAnswerChange,
  onOptionClick,
  onShortAnswerSubmit,
  selectedAnswer,
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
    <form
      onSubmit={onShortAnswerSubmit}
      className="flex flex-col gap-4 mt-4"
    >
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
