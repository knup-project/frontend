'use client';

import { useState } from 'react';
import { useParticipantStore } from '../store';
import { useLeaderboard, useTeamLeaderboard } from '@/features/leaderboard/hooks';
import { useSession } from '@/features/sessions/hooks';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/shared/types/api';

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

interface Props {
  sessionId: string;
}

type Tab = 'individual' | 'team';

export default function PlayerLeaderboardClient({ sessionId }: Props) {
  const { participantId, nickname } = useParticipantStore((s) => ({
    participantId: s.participantId,
    nickname: s.nickname,
  }));

  const { data: session } = useSession(sessionId);
  const isTeamMode = session?.mode === 'TEAM';

  const [activeTab, setActiveTab] = useState<Tab>('individual');

  const { data: individualData, isLoading: loadingIndividual } = useLeaderboard(sessionId);
  const { data: teamData, isLoading: loadingTeam } = useTeamLeaderboard(
    isTeamMode ? sessionId : null,
  );

  const showTeamTab = isTeamMode;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* 헤더 */}
      <div className="px-6 pt-8 pb-4 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold text-white mb-1">최종 결과</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{session?.quizTitle}</p>
      </div>

      {/* 탭 (팀 모드일 때만) */}
      {showTeamTab && (
        <div
          className="flex mx-6 mb-4 rounded-full p-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          {(['individual', 'team'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  activeTab === tab ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
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
            myNickname={nickname}
          />
        ) : (
          <TeamLeaderboard
            entries={teamData?.entries ?? []}
            isLoading={loadingTeam}
          />
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
  myNickname: string | null;
}

function IndividualLeaderboard({
  entries,
  isLoading,
  myParticipantId,
}: IndividualLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>순위 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isMe = entry.participantId === myParticipantId;
        const medal = MEDAL_EMOJI[entry.rank - 1];

        return (
          <div
            key={entry.participantId}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
            style={{
              backgroundColor: isMe
                ? 'rgba(255, 56, 92, 0.25)'
                : 'rgba(255,255,255,0.07)',
              border: isMe
                ? '1px solid rgba(255,56,92,0.4)'
                : '1px solid transparent',
            }}
          >
            {/* 순위 */}
            <div className="w-10 text-center">
              {medal ? (
                <span className="text-2xl">{medal}</span>
              ) : (
                <span
                  className="text-lg font-bold"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {entry.rank}
                </span>
              )}
            </div>

            {/* 닉네임 */}
            <div className="flex-1">
              <p className="font-semibold text-white">
                {entry.nickname}
                {isMe && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                    }}
                  >
                    나
                  </span>
                )}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                정답 {entry.correctCount}개 · 평균 {entry.averageResponseTimeSec.toFixed(1)}초
              </p>
            </div>

            {/* 점수 */}
            <div className="text-right">
              <p className="text-white font-bold text-lg">
                {entry.totalPoints.toLocaleString()}
              </p>
              <p
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                점
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// 팀 리더보드
// ─────────────────────────────────────────────

interface TeamLeaderboardProps {
  entries: TeamLeaderboardEntry[];
  isLoading: boolean;
}

function TeamLeaderboard({ entries, isLoading }: TeamLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>팀 순위 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const medal = MEDAL_EMOJI[entry.rank - 1];
        return (
          <div
            key={entry.teamId}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="w-10 text-center">
              {medal ? (
                <span className="text-2xl">{medal}</span>
              ) : (
                <span
                  className="text-lg font-bold"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-white">{entry.teamName}</p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {entry.memberCount}명
              </p>
            </div>

            <div className="text-right">
              <p className="text-white font-bold text-lg">
                {entry.totalPoints.toLocaleString()}
              </p>
              <p
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                점
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// 나의 순위 배너 (하단 고정)
// ─────────────────────────────────────────────

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
      style={{
        backgroundColor: 'var(--color-primary)',
        boxShadow: '0 -4px 20px rgba(255,56,92,0.3)',
      }}
    >
      <div className="text-white/80 text-sm font-medium">내 순위</div>
      <div className="flex-1">
        <p className="font-bold text-white">{nickname ?? me.nickname}</p>
      </div>
      <div className="text-right">
        <p className="text-white font-bold text-xl">{me.rank}위</p>
        <p className="text-white/70 text-xs">{me.totalPoints.toLocaleString()}점</p>
      </div>
    </div>
  );
}
