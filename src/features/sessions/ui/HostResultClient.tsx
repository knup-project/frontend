'use client';

import Link from 'next/link';
import { useLeaderboard } from '@/features/leaderboard/hooks';
import { useSessionStats } from '@/features/leaderboard/hooks';
import { useSession } from '../hooks';

export function HostResultClient({ sessionId }: { sessionId: string }) {
  const { data: session } = useSession(sessionId);
  const { data: leaderboard } = useLeaderboard(sessionId);
  const { data: stats } = useSessionStats(sessionId);

  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-[#222222] flex flex-col items-center py-12 px-4 gap-8">
      {/* 타이틀 */}
      <div className="text-center">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
          퀴즈 종료!
        </h1>
        {session && (
          <p style={{ fontSize: '16px', color: '#929292', marginTop: '8px' }}>
            {session.quizTitle}
          </p>
        )}
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          {[
            { label: '총 참가자', value: `${stats.totalParticipants}명` },
            { label: '전체 정답률', value: `${Math.round(stats.overallAccuracy * 100)}%` },
            { label: '평균 응답 시간', value: `${stats.averageResponseTimeSec.toFixed(1)}초` },
            { label: '총 답변 수', value: `${stats.answeredCount}개` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>{item.value}</p>
              <p style={{ fontSize: '12px', color: '#929292', marginTop: '4px' }}>{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 최종 리더보드 */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-2">
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
            최종 순위
          </p>
          {leaderboard.entries.slice(0, 10).map((entry, i) => (
            <div
              key={entry.participantId}
              className="flex items-center gap-3 rounded-[8px] px-4 py-3"
              style={{
                background: i < 3 ? 'rgba(255,56,92,0.15)' : 'rgba(255,255,255,0.05)',
                border: i < 3 ? '1px solid rgba(255,56,92,0.3)' : '1px solid transparent',
              }}
            >
              <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>
                {MEDAL[i] ?? `${i + 1}`}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'white', flex: 1 }}>
                {entry.nickname}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 700 }}>
                {entry.totalPoints}pt
              </span>
              <span style={{ fontSize: '12px', color: '#929292' }}>
                {entry.correctCount}정답
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/quizzes"
          style={{
            height: '48px', padding: '0 24px',
            background: 'rgba(255,255,255,0.1)', color: 'white',
            fontSize: '15px', fontWeight: 500,
            borderRadius: '9999px', border: 'none',
            display: 'flex', alignItems: 'center',
          }}
        >
          내 퀴즈로 돌아가기
        </Link>
        <Link
          href="/host/sessions/new"
          style={{
            height: '48px', padding: '0 24px',
            background: 'var(--color-primary)', color: 'white',
            fontSize: '15px', fontWeight: 700,
            borderRadius: '9999px', border: 'none',
            display: 'flex', alignItems: 'center',
          }}
        >
          새 세션 시작
        </Link>
      </div>
    </div>
  );
}
