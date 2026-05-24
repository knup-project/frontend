'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipantStore } from '../store';
import { useSubmitAnswer } from '../hooks';
import { useQuestionTimer } from '../hooks/useQuestionTimer';
import { storeResult } from '../lib/resultStorage';
import { QuestionOptions } from './QuestionOptions';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import type {
  AnswerResultResponse,
  SessionQuestionEvent,
  SessionStatusEvent,
} from '@/shared/types/api';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

type Phase = 'waiting' | 'question' | 'submitted';

interface ActiveQuestion {
  event: SessionQuestionEvent;
  startedAt: number;
}

interface Props {
  sessionId: string;
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

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

  const { mutate: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

  // ── 카운트다운 타이머 (훅으로 분리) ───────────

  useQuestionTimer({
    activeQuestion: activeQuestion
      ? { startedAt: activeQuestion.startedAt, timeLimit: activeQuestion.event.question.timeLimit }
      : null,
    setTimeLeft,
    onTimeout: () => setPhase('submitted'),
  });

  // ── WebSocket 콜백 ─────────────────────────

  const handleQuestion = useCallback((event: SessionQuestionEvent) => {
    const startedAt = Date.now();
    const initialTime = Math.max(event.question.timeLimit, 0);

    setActiveQuestion({ event, startedAt });
    setTimeLeft(initialTime);
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
          router.push(`/play/${sessionId}/result`);
        },
      },
    );
  }

  function handleOptionClick(answer: string) {
    if (phase !== 'question' || selectedAnswer) return;
    submitWithAnswer(answer);
  }

  function handleShortAnswerSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shortAnswer.trim() || phase !== 'question') return;
    submitWithAnswer(shortAnswer.trim());
  }

  // ─────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────

  if (phase === 'waiting') {
    return <WaitingScreen />;
  }

  if (phase === 'submitted') {
    return <SubmittedScreen selectedAnswer={selectedAnswer} />;
  }

  if (!activeQuestion) return null;

  const { question, questionIndex, totalQuestions } = activeQuestion.event;
  const timerPercent = (timeLeft / question.timeLimit) * 100;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: DARK_BG }}
    >
      {/* 헤더: 진행률 바 + 문제 번호 + 타이머 + 점수 */}
      <div className="px-6 pt-6 pb-4">
        <TimerBar percent={timerPercent} />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {questionIndex + 1} / {totalQuestions}
          </span>
          <TimerBadge timeLeft={timeLeft} />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {question.points}점
          </span>
        </div>
      </div>

      {/* 문제 본문 */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-white text-xl font-bold leading-relaxed">{question.content}</p>
        </div>
      </div>

      {/* 답변 영역 */}
      <div className="flex-1 px-4 pb-6">
        <QuestionOptions
          type={question.type}
          options={question.options}
          selectedAnswer={selectedAnswer}
          shortAnswer={shortAnswer}
          onOptionClick={handleOptionClick}
          onShortAnswerChange={setShortAnswer}
          onShortAnswerSubmit={handleShortAnswerSubmit}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 공통 상수
// ─────────────────────────────────────────────

const DARK_BG = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

// ─────────────────────────────────────────────
// 화면 단계별 소형 컴포넌트
// ─────────────────────────────────────────────

function WaitingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: DARK_BG }}>
      <div className="text-center">
        <div className="text-5xl mb-6 animate-pulse">🎯</div>
        <h2 className="text-white text-2xl font-bold mb-2">다음 문제를 기다리는 중</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>호스트가 문제를 시작하면 나타납니다</p>
      </div>
    </div>
  );
}

function SubmittedScreen({ selectedAnswer }: { selectedAnswer: string | null }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: DARK_BG }}>
      <div className="text-center">
        <div className="text-5xl mb-6">{selectedAnswer ? '✅' : '⏱️'}</div>
        <h2 className="text-white text-2xl font-bold mb-2">
          {selectedAnswer ? '제출 완료!' : '시간 종료!'}
        </h2>
        {selectedAnswer && (
          <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-lg">
            선택한 답: <span className="font-semibold text-white">{selectedAnswer}</span>
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.5)' }} className="mt-2">결과를 불러오는 중...</p>
      </div>
    </div>
  );
}

function TimerBar({ percent }: { percent: number }) {
  const color =
    percent > 50 ? 'var(--color-primary)' : percent > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
      <div
        className="h-2 rounded-full transition-all duration-1000"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

function TimerBadge({ timeLeft }: { timeLeft: number }) {
  const isUrgent = timeLeft <= 5;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg"
      style={{
        backgroundColor: isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
        color: isUrgent ? '#fca5a5' : 'white',
      }}
    >
      ⏱ {timeLeft}
    </div>
  );
}
