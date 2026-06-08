'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipantStore } from '../store';
import { useSession } from '@/features/sessions/hooks';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import { CountUp } from '@/shared/ui/CountUp';
import { Knupy } from '@/shared/ui/Knupy';
import type { SessionStatusEvent } from '@/shared/types/api';

interface Props {
  sessionId: string;
}

export default function PlayerWaitingClient({ sessionId }: Props) {
  const router = useRouter();
  const participantId = useParticipantStore((s) => s.participantId);
  const nickname = useParticipantStore((s) => s.nickname);

  const { data: session } = useSession(sessionId);

  // 세션이 이미 IN_PROGRESS 상태면 바로 이동
  useEffect(() => {
    if (session?.status === 'IN_PROGRESS') {
      router.push(`/play/${sessionId}/question`);
    }
    if (session?.status === 'FINISHED') {
      router.push(`/play/${sessionId}/leaderboard`);
    }
  }, [session?.status, sessionId, router]);

  // WebSocket: 상태 변경 이벤트 수신
  const handleStatus = (event: SessionStatusEvent) => {
    if (event.status === 'IN_PROGRESS') {
      router.push(`/play/${sessionId}/question`);
    } else if (event.status === 'FINISHED') {
      router.push(`/play/${sessionId}/leaderboard`);
    }
  };

  const { connected } = useSessionSocket({
    sessionId,
    participantId,
    enabled: !!sessionId,
    onStatus: handleStatus,
  });

  const participantCount = session?.participantCount ?? 0;
  const quizTitle = session?.quizTitle ?? '퀴즈 로딩 중…';

  return (
    <div className="stage min-h-screen flex flex-col items-center justify-center p-6">
      {/* 퀴즈 제목 */}
      <div className="text-center mb-12">
        <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--stage-muted)' }}>
          참가 완료
        </p>
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--stage-text)' }}>
          {quizTitle}
        </h1>
        {nickname && (
          <p style={{ color: 'var(--stage-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
              {nickname}
            </span>
            으로 입장
          </p>
        )}
      </div>

      {/* 대기 모션 */}
      <div className="mb-12 flex flex-col items-center gap-6">
        <Knupy mood="thinking" size={104} />

        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--stage-text)' }}>
            호스트를 기다리는 중
          </p>
          <p style={{ color: 'var(--stage-muted)' }} className="text-sm mt-1">
            호스트가 퀴즈를 시작하면 자동으로 이동합니다
          </p>
        </div>
      </div>

      {/* 참가자 수 / 연결 상태 */}
      <div className="flex gap-4">
        <div className="stage-chip">
          👥&nbsp;<span className="tabular"><CountUp value={participantCount} /></span>명 참가 중
        </div>

        <div
          className="stage-chip"
          style={{
            backgroundColor: connected ? 'rgba(31,169,113,0.16)' : 'rgba(255,255,255,0.06)',
            color: connected ? 'var(--color-correct)' : 'var(--stage-muted)',
          }}
        >
          {connected ? '🟢 연결됨' : '⚪ 연결 중…'}
        </div>
      </div>
    </div>
  );
}
