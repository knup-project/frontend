'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useParticipantStore } from '../store';
import { readStoredResult, clearStoredResult } from '../lib/resultStorage';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import { CountUp } from '@/shared/ui/CountUp';
import { Celebration } from '@/shared/ui/Celebration';
import { transitions } from '@/shared/lib/motion';
import type { AnswerResultResponse, SessionQuestionEvent, SessionStatusEvent } from '@/shared/types/api';

interface Props {
  sessionId: string;
}

// 정답 시 그린 글로우 무대 (오답은 두 번째 레드를 쓰지 않고 기본 중립 무대 유지)
const CORRECT_STAGE =
  'radial-gradient(120% 90% at 50% -10%, rgba(31,169,113,0.22), transparent 55%),' +
  'radial-gradient(120% 80% at 50% 0%, var(--stage-surface) 0%, var(--stage-ink) 48%, var(--stage-bg) 100%)';

export default function PlayerResultClient({ sessionId }: Props) {
  const router = useRouter();
  const { participantId } = useParticipantStore((s) => ({
    participantId: s.participantId,
  }));

  // lazy initializer로 마운트 시 1회만 읽기 (effect 내 setState 회피)
  const [result] = useState<AnswerResultResponse | null>(() => {
    const stored = readStoredResult();
    clearStoredResult();
    return stored;
  });

  // WebSocket: 다음 문제 또는 세션 종료 수신
  const handleQuestion = useCallback(
    (_e: SessionQuestionEvent) => {
      router.push(`/play/${sessionId}/question`);
    },
    [router, sessionId],
  );

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

  if (!result) {
    return (
      <div className="stage min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-6" aria-hidden>
            ⏳
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--stage-text)' }}>
            결과를 기다리는 중
          </h2>
          <p style={{ color: 'var(--stage-muted)' }}>다음 문제가 시작되면 자동으로 이동합니다</p>
        </div>
      </div>
    );
  }

  const correct = result.correct;

  return (
    <div
      className="stage min-h-screen flex flex-col items-center justify-center p-6"
      style={correct ? { background: CORRECT_STAGE } : undefined}
    >
      <Celebration show={correct} />

      {/* 정답 / 오답 — 정답은 팝, 오답은 흔들림 + 위로 */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={correct ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: [0, -8, 8, -5, 5, 0] }}
        transition={transitions.pop}
      >
        <div className="text-7xl mb-4" aria-hidden>
          {correct ? '🎉' : '😅'}
        </div>
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ color: correct ? 'var(--color-correct)' : 'var(--stage-text)' }}
        >
          {correct ? '정답이에요!' : '아쉬워요'}
        </h1>
        {!correct && (
          <p className="text-base mb-1" style={{ color: 'var(--stage-muted)' }}>
            다음 문제에서 만회해요!
          </p>
        )}
        <p className="text-lg" style={{ color: 'var(--stage-muted)' }}>
          정답은 <span className="font-semibold" style={{ color: 'var(--color-correct)' }}>{result.correctAnswer}</span>
        </p>
      </motion.div>

      {/* 점수 카드 — 카운트업 */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
        <ScoreCard label="획득 점수" value={result.points} prefix="+" highlight={correct} />
        <ScoreCard label="총 점수" value={result.totalPoints} />
        <ScoreCard label="현재 순위" value={result.rank} suffix="위" />
      </div>

      <div className="stage-chip">
        <span className="text-sm font-medium" style={{ color: 'var(--stage-muted)' }}>
          다음 문제를 기다리는 중…
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 점수 카드 (카운트업)
// ─────────────────────────────────────────────

function ScoreCard({
  label,
  value,
  prefix,
  suffix,
  highlight,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="stage-card flex flex-col items-center justify-center gap-1 p-4"
      style={highlight ? { borderColor: 'var(--color-gold)', boxShadow: 'var(--glow-gold)' } : undefined}
    >
      <span
        className="text-2xl font-bold tabular"
        style={{ color: highlight ? 'var(--color-gold)' : 'var(--stage-text)' }}
      >
        {prefix}
        <CountUp value={value} />
        {suffix}
      </span>
      <span className="text-xs font-medium text-center" style={{ color: 'var(--stage-muted)' }}>
        {label}
      </span>
    </div>
  );
}
