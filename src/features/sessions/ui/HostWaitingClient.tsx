'use client';

import { useRouter } from 'next/navigation';
import { useSession, useStartSession } from '../hooks';
import { useSessionSocket } from '../socket/hooks';
import { getApiErrorMessage } from '@/shared/api/error';
import { useState } from 'react';

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
        <span style={{ color: '#6a6a6a' }}>세션 불러오는 중...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p style={{ color: '#c13515' }}>세션을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#222222] flex flex-col items-center justify-center gap-8 p-8">
      {/* 퀴즈 제목 */}
      <div className="text-center">
        <p style={{ fontSize: '14px', color: '#929292', marginBottom: '8px' }}>
          {session.quizTitle}
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
          참가자를 기다리는 중
        </h1>
      </div>

      {/* PIN 디스플레이 */}
      <div
        className="rounded-[14px] text-center"
        style={{ background: '#ff385c', padding: '32px 48px' }}
      >
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
          참가 PIN
        </p>
        <p style={{ fontSize: '64px', fontWeight: 700, color: 'white', letterSpacing: '8px', lineHeight: 1 }}>
          {session.pin}
        </p>
      </div>

      {/* 참가자 카운트 */}
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: connected ? '#22c55e' : '#929292' }}
        />
        <span style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>
          {session.participantCount}명 참가 중
        </span>
        {session.maxParticipants && (
          <span style={{ fontSize: '14px', color: '#929292' }}>
            / 최대 {session.maxParticipants}명
          </span>
        )}
      </div>

      {/* 세션 정보 */}
      <div className="flex gap-4 text-center">
        <div className="px-4 py-2 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '12px', color: '#929292' }}>방식</p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
            {session.mode === 'INDIVIDUAL' ? '개인전' : '팀전'}
          </p>
        </div>
        <div className="px-4 py-2 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '12px', color: '#929292' }}>문제 수</p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
            {session.totalQuestions}개
          </p>
        </div>
      </div>

      {errorMsg && (
        <p style={{ fontSize: '14px', color: '#ffd1da' }}>{errorMsg}</p>
      )}

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        disabled={isPending || session.participantCount === 0}
        style={{
          height: '56px', padding: '0 48px',
          background: isPending || session.participantCount === 0 ? '#ffd1da' : 'white',
          color: isPending || session.participantCount === 0 ? '#929292' : '#ff385c',
          fontSize: '18px', fontWeight: 700,
          borderRadius: '9999px', border: 'none',
          cursor: isPending || session.participantCount === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? '시작 중...' : '퀴즈 시작!'}
      </button>

      {session.participantCount === 0 && (
        <p style={{ fontSize: '13px', color: '#929292' }}>
          참가자가 1명 이상 있어야 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
}
