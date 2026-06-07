'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useLeaderboard } from '@/features/leaderboard/hooks';
import { useSessionStats } from '@/features/leaderboard/hooks';
import { useSession } from '../hooks';
import { CountUp } from '@/shared/ui/CountUp';
import { staggerChildren, fadeUp, transitions } from '@/shared/lib/motion';

const MEDAL = ['🥇', '🥈', '🥉'];
const oneDecimal = (n: number) => n.toFixed(1);

export function HostResultClient({ sessionId }: { sessionId: string }) {
  const { data: session } = useSession(sessionId);
  const { data: leaderboard } = useLeaderboard(sessionId);
  const { data: stats } = useSessionStats(sessionId);

  return (
    <div className="stage min-h-screen flex flex-col items-center py-12 px-4 gap-8">
      {/* 타이틀 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.pop}
      >
        <div className="text-5xl mb-3" aria-hidden>
          🏆
        </div>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--stage-text)' }}>
          퀴즈 종료!
        </h1>
        {session && (
          <p className="text-base mt-2" style={{ color: 'var(--stage-muted)' }}>
            {session.quizTitle}
          </p>
        )}
      </motion.div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          <StatCard label="총 참가자" value={stats.totalParticipants} suffix="명" />
          <StatCard label="전체 정답률" value={Math.round(stats.overallAccuracy * 100)} suffix="%" accent />
          <StatCard label="평균 응답 시간" value={stats.averageResponseTimeSec} suffix="초" format={oneDecimal} />
          <StatCard label="총 답변 수" value={stats.answeredCount} suffix="개" />
        </div>
      )}

      {/* 최종 리더보드 */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-2">
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--stage-text)' }}>
            최종 순위
          </p>
          <motion.div className="flex flex-col gap-2" variants={staggerChildren} initial="hidden" animate="show">
            {leaderboard.entries.slice(0, 10).map((entry, i) => {
              const isFirst = i === 0;
              return (
                <motion.div
                  key={entry.participantId}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: isFirst
                      ? 'rgba(201,162,39,0.16)'
                      : i < 3
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(255,255,255,0.05)',
                    border: isFirst ? '1px solid rgba(201,162,39,0.5)' : '1px solid var(--stage-border)',
                    boxShadow: isFirst ? 'var(--glow-gold)' : undefined,
                  }}
                >
                  <span className="text-xl tabular" style={{ width: 28, textAlign: 'center' }} aria-hidden>
                    {MEDAL[i] ?? <span style={{ color: 'var(--stage-muted)', fontSize: 14 }}>{i + 1}</span>}
                  </span>
                  <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--stage-text)' }}>
                    {entry.nickname}
                  </span>
                  <span className="text-sm font-bold tabular" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--color-primary)' }}>
                    {entry.totalPoints}pt
                  </span>
                  <span className="text-xs tabular" style={{ color: 'var(--stage-muted)' }}>
                    {entry.correctCount}정답
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/quizzes"
          className="inline-flex items-center"
          style={{
            height: 48,
            padding: '0 24px',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--stage-text)',
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 9999,
            border: '1px solid var(--stage-border)',
          }}
        >
          내 퀴즈로 돌아가기
        </Link>
        <Link
          href="/host/sessions/new"
          className="btn-primary"
          style={{ height: 48, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 700 }}
        >
          새 세션 시작
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 통계 카드 (카운트업)
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  accent,
  format,
}: {
  label: string;
  value: number;
  suffix: string;
  accent?: boolean;
  format?: (n: number) => string;
}) {
  return (
    <div className="stage-card p-4 text-center" style={accent ? { borderColor: 'var(--color-gold)' } : undefined}>
      <p className="text-2xl font-bold tabular" style={{ color: accent ? 'var(--color-gold)' : 'var(--stage-text)' }}>
        <CountUp value={value} format={format} />
        {suffix}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--stage-muted)' }}>
        {label}
      </p>
    </div>
  );
}
