'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipantStore } from '../store';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import type { AnswerResultResponse, SessionQuestionEvent, SessionStatusEvent } from '@/shared/types/api';

// ─────────────────────────────────────────────
// sessionStorage 헬퍼
// ─────────────────────────────────────────────

const RESULT_STORAGE_KEY = 'knup-question-result';

function readStoredResult(): AnswerResultResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnswerResultResponse;
  } catch {
    return null;
  }
}

function clearStoredResult() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
  }
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

interface Props {
  sessionId: string;
}

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

  // 결과 없음 (직접 URL 접근 등)
  if (!result) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-white text-2xl font-bold mb-2">결과를 기다리는 중</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            다음 문제가 시작되면 자동으로 이동합니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: result.correct
          ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
          : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
      }}
    >
      {/* 정답 / 오답 */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-6 animate-bounce">
          {result.correct ? '⭕' : '❌'}
        </div>
        <h1
          className="text-4xl font-bold text-white mb-2"
        >
          {result.correct ? '정답!' : '오답!'}
        </h1>
        <p
          className="text-lg"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          정답: <span className="font-semibold text-white">{result.correctAnswer}</span>
        </p>
      </div>

      {/* 점수 카드들 */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
        <ScoreCard
          label="획득 점수"
          value={`+${result.points}`}
          highlight={result.correct}
        />
        <ScoreCard
          label="총 점수"
          value={String(result.totalPoints)}
          highlight={false}
        />
        <ScoreCard
          label="현재 순위"
          value={`${result.rank}위`}
          highlight={false}
        />
      </div>

      {/* 다음 대기 안내 */}
      <div
        className="text-center px-6 py-4 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          다음 문제를 기다리는 중...
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 점수 카드 서브컴포넌트
// ─────────────────────────────────────────────

interface ScoreCardProps {
  label: string;
  value: string;
  highlight: boolean;
}

function ScoreCard({ label, value, highlight }: ScoreCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-2xl p-4"
      style={{
        backgroundColor: highlight
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.1)',
      }}
    >
      <span
        className="text-2xl font-bold text-white"
      >
        {value}
      </span>
      <span
        className="text-xs font-medium text-center"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        {label}
      </span>
    </div>
  );
}
