'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useParticipantStore } from '../store';
import { useLeaderboard, useTeamLeaderboard } from '@/features/leaderboard/hooks';
import { useSession } from '@/features/sessions/hooks';
import { CountUp } from '@/shared/ui/CountUp';
import { staggerChildren, fadeUp } from '@/shared/lib/motion';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/shared/types/api';

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

interface Props {
  sessionId: string;
}

type Tab = 'individual' | 'team';

// 1등은 골드 글로우, 그 외는 무대 톤
function rowStyle({ isMe, isFirst }: { isMe: boolean; isFirst: boolean }): React.CSSProperties {
  if (isMe) {
    return { backgroundColor: 'rgba(230,0,0,0.16)', border: '1px solid rgba(230,0,0,0.45)' };
  }
  if (isFirst) {
    return {
      backgroundColor: 'rgba(201,162,39,0.14)',
      border: '1px solid rgba(201,162,39,0.5)',
      boxShadow: 'var(--glow-gold)',
    };
  }
  return { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--stage-border)' };
}

export default function PlayerLeaderboardClient({ sessionId }: Props) {
  const participantId = useParticipantStore((s) => s.participantId);
  const nickname = useParticipantStore((s) => s.nickname);

  const { data: session } = useSession(sessionId);
  const isTeamMode = session?.mode === 'TEAM';

  const [activeTab, setActiveTab] = useState<Tab>('individual');

  const { data: individualData, isLoading: loadingIndividual } = useLeaderboard(sessionId);
  const { data: teamData, isLoading: loadingTeam } = useTeamLeaderboard(
    isTeamMode ? sessionId : null,
  );

  const showTeamTab = isTeamMode;

  return (
    <div className="stage min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="px-6 pt-8 pb-4 text-center">
        <div className="text-4xl mb-3" aria-hidden>
          🏆
        </div>
        <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--stage-text)' }}>
          최종 결과
        </h1>
        <p style={{ color: 'var(--stage-muted)' }}>{session?.quizTitle}</p>
      </div>

      {/* 탭 (팀 모드일 때만) */}
      {showTeamTab && (
        <div
          className="flex mx-6 mb-4 rounded-full p-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid var(--stage-border)' }}
        >
          {(['individual', 'team'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--stage-muted)',
              }}
            >
              {tab === 'individual' ? '개인' : '팀'}
            </button>
          ))}
        </div>
      )}

      {/* 리더보드 */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {activeTab === 'individual' ? (
          <IndividualLeaderboard
            entries={individualData?.entries ?? []}
            isLoading={loadingIndividual}
            myParticipantId={participantId}
          />
        ) : (
          <TeamLeaderboard entries={teamData?.entries ?? []} isLoading={loadingTeam} />
        )}
      </div>

      {/* 하단: 나의 정보 */}
      {activeTab === 'individual' && participantId && (
        <MyRankBanner
          entries={individualData?.entries ?? []}
          participantId={participantId}
          nickname={nickname}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 개인 리더보드
// ─────────────────────────────────────────────

interface IndividualLeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  myParticipantId: string | null;
}

function IndividualLeaderboard({ entries, isLoading, myParticipantId }: IndividualLeaderboardProps) {
  if (isLoading) {
    return <CenterNote text="로딩 중…" />;
  }
  if (!entries.length) {
    return <CenterNote text="순위 정보가 없습니다" />;
  }

  return (
    <motion.div className="flex flex-col gap-2" variants={staggerChildren} initial="hidden" animate="show">
      {entries.map((entry) => {
        const isMe = entry.participantId === myParticipantId;
        const isFirst = entry.rank === 1;
        const medal = MEDAL_EMOJI[entry.rank - 1];

        return (
          <motion.div
            key={entry.participantId}
            variants={fadeUp}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl"
            style={rowStyle({ isMe, isFirst })}
          >
            <div className="w-10 text-center">
              {medal ? (
                <span className="text-2xl" aria-hidden>
                  {medal}
                </span>
              ) : (
                <span className="text-lg font-bold tabular" style={{ color: 'var(--stage-muted)' }}>
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--stage-text)' }}>
                {entry.nickname}
                {isMe && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                  >
                    나
                  </span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--stage-muted)' }}>
                정답 {entry.correctCount}개 · 평균 {entry.averageResponseTimeSec.toFixed(1)}초
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg tabular" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--stage-text)' }}>
                <CountUp value={entry.totalPoints} />
              </p>
              <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>
                점
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 팀 리더보드
// ─────────────────────────────────────────────

function TeamLeaderboard({ entries, isLoading }: { entries: TeamLeaderboardEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return <CenterNote text="로딩 중…" />;
  }
  if (!entries.length) {
    return <CenterNote text="팀 순위 정보가 없습니다" />;
  }

  return (
    <motion.div className="flex flex-col gap-2" variants={staggerChildren} initial="hidden" animate="show">
      {entries.map((entry) => {
        const isFirst = entry.rank === 1;
        const medal = MEDAL_EMOJI[entry.rank - 1];
        return (
          <motion.div
            key={entry.teamId}
            variants={fadeUp}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl"
            style={rowStyle({ isMe: false, isFirst })}
          >
            <div className="w-10 text-center">
              {medal ? (
                <span className="text-2xl" aria-hidden>
                  {medal}
                </span>
              ) : (
                <span className="text-lg font-bold tabular" style={{ color: 'var(--stage-muted)' }}>
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--stage-text)' }}>
                {entry.teamName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--stage-muted)' }}>
                {entry.memberCount}명
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg tabular" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--stage-text)' }}>
                <CountUp value={entry.totalPoints} />
              </p>
              <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>
                점
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 보조 컴포넌트
// ─────────────────────────────────────────────

function CenterNote({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <p style={{ color: 'var(--stage-muted)' }}>{text}</p>
    </div>
  );
}

interface MyRankBannerProps {
  entries: LeaderboardEntry[];
  participantId: string;
  nickname: string | null;
}

function MyRankBanner({ entries, participantId, nickname }: MyRankBannerProps) {
  const me = entries.find((e) => e.participantId === participantId);
  if (!me) return null;

  return (
    <div
      className="sticky bottom-0 mx-4 mb-4 flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{ backgroundColor: 'var(--color-primary)', boxShadow: 'var(--glow-red)' }}
    >
      <div className="text-white/80 text-sm font-medium">내 순위</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white truncate">{nickname ?? me.nickname}</p>
      </div>
      <div className="text-right">
        <p className="text-white font-bold text-xl tabular">{me.rank}위</p>
        <p className="text-white/70 text-xs tabular">{me.totalPoints.toLocaleString()}점</p>
      </div>
    </div>
  );
}
