'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipantStore } from '../store';
import { useSession } from '@/features/sessions/hooks';
import { useSessionSocket } from '@/features/sessions/socket/hooks';
import type { SessionStatusEvent } from '@/shared/types/api';

interface Props {
  sessionId: string;
}

export default function PlayerWaitingClient({ sessionId }: Props) {
  const router = useRouter();
  const { participantId, nickname } = useParticipantStore((s) => ({
    participantId: s.participantId,
    nickname: s.nickname,
  }));

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
  const quizTitle = session?.quizTitle ?? '퀴즈 로딩 중...';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* 퀴즈 제목 */}
      <div className="text-center mb-12">
        <p
          className="text-sm font-medium mb-3 uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          참가 완료
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">{quizTitle}</h1>
        {nickname && (
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              {nickname}
            </span>
            으로 참가 중
          </p>
        )}
      </div>

      {/* 대기 애니메이션 */}
      <div className="mb-12 flex flex-col items-center gap-6">
        {/* 스피너 */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full border-4 border-white/10 border-t-white/70 animate-spin"
          />
          <div
            className="absolute inset-0 flex items-center justify-center text-3xl"
          >
            ⏳
          </div>
        </div>

        <div className="text-center">
          <p className="text-white text-lg font-medium">호스트를 기다리는 중</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm mt-1">
            호스트가 퀴즈를 시작하면 자동으로 이동합니다
          </p>
        </div>
      </div>

      {/* 참가자 수 / 연결 상태 */}
      <div className="flex gap-4">
        <div
          className="px-5 py-3 rounded-full text-white font-medium text-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          👥 {participantCount}명 참가 중
        </div>

        <div
          className="px-5 py-3 rounded-full text-sm font-medium"
          style={{
            backgroundColor: connected
              ? 'rgba(34,197,94,0.15)'
              : 'rgba(255,255,255,0.1)',
            color: connected ? '#4ade80' : 'rgba(255,255,255,0.5)',
          }}
        >
          {connected ? '🟢 연결됨' : '⚪ 연결 중...'}
        </div>
      </div>
    </div>
  );
}
