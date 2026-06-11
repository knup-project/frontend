'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useParticipantStore } from '../store';
import { useSubmitAnswer } from '../hooks';
import { useQuestionTimer } from '../hooks/useQuestionTimer';
import { storeResult } from '../lib/resultStorage';
import { QuestionOptions } from './QuestionOptions';
import { useSession } from '@/features/sessions/hooks';
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
  const { data: session } = useSession(sessionId);

  // 콜백/이펙트에서 최신 activeQuestion 참조 (중복 이벤트 가드용)
  const activeQuestionRef = useRef<ActiveQuestion | null>(null);
  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  });

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
    // 같은 문제의 중복 수신(재브로드캐스트/복구 직후 WS 도착)이면 타이머를 리셋하지 않는다
    if (activeQuestionRef.current?.event.question.id === event.question.id) return;

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

  // ── 폴백: WS question 이벤트를 놓쳤을 때 세션 스냅샷으로 복구 ──
  // 페이지 전환 직후 구독 공백에 문제가 송출되면 WS 만으로는 영영 못 받는다.
  // 세션 폴링(useSession)이 currentQuestion 을 주면 남은 시간과 함께 복구한다.
  useEffect(() => {
    const cq = session?.currentQuestion;
    if (!cq || session.status !== 'IN_PROGRESS') return;
    if (activeQuestionRef.current?.event.question.id === cq.id) return;

    const remaining = Math.max(
      0,
      Math.min(cq.timeLimit, session.questionRemainingSec ?? cq.timeLimit),
    );
    if (remaining <= 0) return; // 이미 시간이 끝난 문제는 복구하지 않음

    setActiveQuestion({
      event: {
        sessionId,
        questionIndex: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions,
        question: cq,
        startedAt: '',
      },
      // 경과분을 반영해 responseTimeSec 계산이 맞도록 시작 시각을 보정
      startedAt: Date.now() - (cq.timeLimit - remaining) * 1000,
    });
    setTimeLeft(remaining);
    setSelectedAnswer(null);
    setShortAnswer('');
    setPhase('question');
  }, [session, sessionId]);

  // ── 폴백: WS status 이벤트를 놓쳐도 폴링으로 종료 감지 ──
  useEffect(() => {
    if (session?.status === 'FINISHED') {
      router.push(`/play/${sessionId}/leaderboard`);
    }
  }, [session?.status, router, sessionId]);

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
          storeResult(result, activeQuestion.event.question.id);
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
          {selectedAnswer ? '결과를 불러오는 중…' : '다음 문제를 기다리는 중…'}
        </p>
      </motion.div>
    </div>
  );
}
