'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  useSession,
  useStartSession,
  useEndSession,
  useKickParticipant,
  useKickParticipants,
} from '../hooks';
import { useSessionSocket } from '../socket/hooks';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/api/error';
import { CountUp } from '@/shared/ui/CountUp';
import type { SessionParticipant } from '@/shared/types/api';

export function HostWaitingClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data: session, isLoading } = useSession(sessionId);
  const { mutate: startSession, isPending } = useStartSession();
  const { mutate: endSession, isPending: ending } = useEndSession();
  const { mutate: kick } = useKickParticipant(sessionId);
  const { mutate: kickMany, isPending: kickingMany } = useKickParticipants(sessionId);
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // WS 실시간 목록(한 번이라도 수신하면 신뢰). 수신 전엔 세션 조회 스냅샷.
  const [wsParticipants, setWsParticipants] = useState<SessionParticipant[]>([]);
  const [wsReceived, setWsReceived] = useState(false);

  const { connected } = useSessionSocket({
    sessionId,
    enabled: !!session,
    onParticipants: (e) => {
      setWsParticipants(e.participants);
      setWsReceived(true);
    },
    onStatus: (e) => {
      if (e.status === 'IN_PROGRESS') {
        router.push(`/host/sessions/${sessionId}/play`);
      }
    },
  });

  const handleStart = () => {
    setErrorMsg('');
    startSession(sessionId, {
      onSuccess: () => router.push(`/host/sessions/${sessionId}/play`),
      onError: (err) => {
        // 이미 시작/종료된 세션이면 에러 대신 현재 상태에 맞는 화면으로 보낸다
        if (getApiErrorCode(err) === 'SESSION_ALREADY_STARTED') {
          if (session?.status === 'FINISHED') {
            router.push(`/host/sessions/${sessionId}/result`);
          } else {
            router.push(`/host/sessions/${sessionId}/play`);
          }
          return;
        }
        setErrorMsg(getApiErrorMessage(err));
      },
    });
  };

  const handleEnd = () => {
    if (!window.confirm('세션을 종료할까요? 참가자들의 진행이 모두 종료됩니다.')) return;
    setErrorMsg('');
    endSession(sessionId, {
      onSuccess: () => router.push('/dashboard/quizzes'),
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

  const participants = wsReceived ? wsParticipants : session.participants;
  const liveCount = participants.length;
  const canStart = !isPending && liveCount > 0;
  const allSelected = liveCount > 0 && selected.size === liveCount;
  const busy = kickingMany;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(participants.map((p) => p.participantId)));
  const kickSelected = () => {
    if (selected.size === 0) return;
    kickMany(Array.from(selected));
    setSelected(new Set());
  };
  const kickAll = () => {
    if (!window.confirm('참가자 전체를 강퇴할까요?')) return;
    kickMany([]);
    setSelected(new Set());
  };

  return (
    <div className="stage flex-1 min-h-screen flex flex-col items-center justify-center gap-7 p-8">
      {/* 퀴즈 제목 */}
      <div className="text-center">
        <p className="text-sm mb-2" style={{ color: 'var(--stage-muted)' }}>
          {session.quizTitle}
        </p>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--stage-text)' }}>
          참가자를 기다리는 중
        </h1>
      </div>

      {/* PIN — RED 네온 */}
      <div
        className="text-center"
        style={{ background: 'var(--color-primary)', boxShadow: 'var(--glow-red-neon)', borderRadius: 24, padding: '28px 52px' }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
          참가 PIN
        </p>
        <p className="tabular" style={{ fontSize: 60, fontWeight: 800, color: '#fff', letterSpacing: '0.12em', lineHeight: 1 }}>
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
          <CountUp value={liveCount} />
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

      {/* 참가자 목록 + select 강퇴 */}
      {participants.length > 0 && (
        <div className="stage-card w-full max-w-md p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--stage-text)' }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: 'var(--color-primary)' }} />
              전체 선택
            </label>
            <span className="text-xs" style={{ color: 'var(--stage-muted)' }}>
              {selected.size > 0 ? `${selected.size}명 선택` : `${liveCount}명`}
            </span>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            {participants.map((p) => (
              <div
                key={p.participantId}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.participantId)}
                  onChange={() => toggle(p.participantId)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span className="text-sm truncate flex-1" style={{ color: 'var(--stage-text)' }}>
                  {p.nickname}
                </span>
                <button
                  type="button"
                  onClick={() => kick(p.participantId)}
                  disabled={busy}
                  className="text-xs font-semibold shrink-0 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-primary-disabled)', cursor: busy ? 'not-allowed' : 'pointer' }}
                >
                  강퇴
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={kickSelected}
              disabled={busy || selected.size === 0}
              className="flex-1 text-sm font-semibold py-2 rounded-xl transition-opacity hover:opacity-80"
              style={{
                border: '1px solid var(--stage-border)',
                background: 'transparent',
                color: selected.size > 0 ? 'var(--color-primary-disabled)' : 'var(--stage-muted)',
                cursor: selected.size > 0 && !busy ? 'pointer' : 'not-allowed',
              }}
            >
              선택 강퇴
            </button>
            <button
              type="button"
              onClick={kickAll}
              disabled={busy}
              className="flex-1 text-sm font-semibold py-2 rounded-xl transition-opacity hover:opacity-80"
              style={{
                border: '1px solid var(--stage-border)',
                background: 'transparent',
                color: 'var(--color-primary-disabled)',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              전체 강퇴
            </button>
          </div>
        </div>
      )}

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

      {/* 액션: 시작 + 세션 종료 */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-primary"
          style={{ height: 56, padding: '0 48px', fontSize: 18, fontWeight: 800, borderRadius: 9999 }}
        >
          {isPending ? '시작 중…' : '퀴즈 시작!'}
        </button>
        <button
          onClick={handleEnd}
          disabled={ending}
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--stage-muted)' }}
        >
          {ending ? '종료 중…' : '세션 종료'}
        </button>
      </div>

      {liveCount === 0 && (
        <p style={{ fontSize: 13, color: 'var(--stage-muted)' }}>
          참가자가 1명 이상 있어야 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
}
