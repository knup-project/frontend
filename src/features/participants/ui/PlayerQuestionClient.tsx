'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useParticipantStore } from '../store';
import { useSubmitAnswer } from '../hooks';
import { useQuestionTimer } from '../hooks/useQuestionTimer';
import { storeResult } from '../lib/resultStorage';
import { QuestionOptions } from './QuestionOptions';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import { CountdownRing } from '@/shared/ui/CountdownRing';
import { Knupy } from '@/shared/ui/Knupy';
import { fadeUp, transitions } from '@/shared/lib/motion';
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
  const participantId = useParticipantStore((s) => s.participantId);

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
  const progress = question.timeLimit > 0 ? timeLeft / question.timeLimit : 0;

  return (
    <div className="stage min-h-screen flex flex-col">
      {/* 헤더: 문제 번호 · 점수 */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <span className="stage-chip tabular">
          {questionIndex + 1} / {totalQuestions}
        </span>
        <span className="stage-chip" style={{ color: 'var(--color-gold)' }}>
          {question.points}점
        </span>
      </div>

      {/* 대형 타이머 링 */}
      <div className="flex justify-center py-2">
        <CountdownRing
          progress={progress}
          size={104}
          stroke={9}
          trackColor="var(--stage-border)"
          textColor="var(--stage-text)"
          label={timeLeft}
        />
      </div>

      {/* 문제 본문 */}
      <div className="px-6 py-3 flex-shrink-0">
        <motion.div
          key={question.id}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="stage-card p-6 text-center"
        >
          <p className="text-xl font-bold leading-relaxed" style={{ color: 'var(--stage-text)' }}>
            {question.content}
          </p>
        </motion.div>
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
// 화면 단계별 소형 컴포넌트
// ─────────────────────────────────────────────

function WaitingScreen() {
  return (
    <div className="stage min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Knupy mood="thinking" size={96} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--stage-text)' }}>
          다음 문제를 기다리는 중
        </h2>
        <p style={{ color: 'var(--stage-muted)' }}>호스트가 문제를 시작하면 나타납니다</p>
      </div>
    </div>
  );
}

function SubmittedScreen({ selectedAnswer }: { selectedAnswer: string | null }) {
  return (
    <div className="stage min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.pop}
        className="text-center"
      >
        <div className="text-6xl mb-6" aria-hidden>
          {selectedAnswer ? '🚀' : '⏱️'}
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--stage-text)' }}>
          {selectedAnswer ? '제출 완료!' : '시간 종료!'}
        </h2>
        {selectedAnswer && (
          <p className="text-lg" style={{ color: 'var(--stage-muted)' }}>
            선택한 답: <span className="font-semibold" style={{ color: 'var(--stage-text)' }}>{selectedAnswer}</span>
          </p>
        )}
        <p style={{ color: 'var(--stage-muted)' }} className="mt-2">
          결과를 불러오는 중…
        </p>
      </motion.div>
    </div>
  );
}
