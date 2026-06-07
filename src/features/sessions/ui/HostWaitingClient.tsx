'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, useStartSession } from '../hooks';
import { useSessionSocket } from '../socket/hooks';
import { getApiErrorMessage } from '@/shared/api/error';
import { CountUp } from '@/shared/ui/CountUp';

export function HostWaitingClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data: session, isLoading } = useSession(sessionId);
  const { mutate: startSession, isPending } = useStartSession();
  const [errorMsg, setErrorMsg] = useState('');

  // WebSocket — 참가자 입장 이벤트 수신
  const { connected } = useSessionSocket({
    sessionId,
    enabled: !!session,
    onParticipants: () => {
      // 참가자 목록 변경 시 session 쿼리 자동 refetch (3초 폴링)
    },
    onStatus: (e) => {
      // 세션 상태 변경 감지
      if (e.status === 'IN_PROGRESS') {
        router.push(`/host/sessions/${sessionId}/play`);
      }
    },
  });

  const handleStart = () => {
    setErrorMsg('');
    startSession(sessionId, {
      onSuccess: () => router.push(`/host/sessions/${sessionId}/play`),
      onError: (err) => setErrorMsg(getApiErrorMessage(err)),
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <span style={{ color: 'var(--color-muted)' }}>세션 불러오는 중…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--color-error)' }}>세션을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const canStart = !isPending && session.participantCount > 0;

  return (
    <div className="stage flex-1 min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* 퀴즈 제목 */}
      <div className="text-center">
        <p className="text-sm mb-2" style={{ color: 'var(--stage-muted)' }}>
          {session.quizTitle}
        </p>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--stage-text)' }}>
          참가자를 기다리는 중
        </h1>
      </div>

      {/* PIN 디스플레이 — RED 네온 */}
      <div
        className="text-center"
        style={{ background: 'var(--color-primary)', boxShadow: 'var(--glow-red-neon)', borderRadius: 24, padding: '32px 56px' }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
          참가 PIN
        </p>
        <p className="tabular" style={{ fontSize: 64, fontWeight: 800, color: '#fff', letterSpacing: '0.12em', lineHeight: 1 }}>
          {session.pin}
        </p>
      </div>

      {/* 참가자 카운트 */}
      <div className="flex items-center gap-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: connected ? 'var(--color-correct)' : 'var(--stage-muted)' }}
        />
        <span className="text-xl font-bold tabular" style={{ color: 'var(--stage-text)' }}>
          <CountUp value={session.participantCount} />
        </span>
        <span className="text-xl font-bold" style={{ color: 'var(--stage-text)' }}>
          명 참가 중
        </span>
        {session.maxParticipants && (
          <span className="text-sm" style={{ color: 'var(--stage-muted)' }}>
            / 최대 {session.maxParticipants}명
          </span>
        )}
      </div>

      {/* 세션 정보 */}
      <div className="flex gap-4 text-center">
        <div className="stage-card px-5 py-3">
          <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>방식</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--stage-text)' }}>
            {session.mode === 'INDIVIDUAL' ? '개인전' : '팀전'}
          </p>
        </div>
        <div className="stage-card px-5 py-3">
          <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>문제 수</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--stage-text)' }}>
            {session.totalQuestions}개
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="u-shake" style={{ fontSize: 14, color: 'var(--color-primary-disabled)' }}>
          {errorMsg}
        </p>
      )}

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="btn-primary"
        style={{ height: 56, padding: '0 48px', fontSize: 18, fontWeight: 800, borderRadius: 9999 }}
      >
        {isPending ? '시작 중…' : '퀴즈 시작!'}
      </button>

      {session.participantCount === 0 && (
        <p style={{ fontSize: 13, color: 'var(--stage-muted)' }}>
          참가자가 1명 이상 있어야 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
}
