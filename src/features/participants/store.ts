'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JoinSessionResponse } from '@/shared/types/api';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

interface ParticipantState {
  participantId: string | null;
  sessionId: string | null;
  nickname: string | null;
  teamId: string | null;
}

interface ParticipantActions {
  setParticipant: (response: JoinSessionResponse) => void;
  clearParticipant: () => void;
}

type ParticipantStore = ParticipantState & ParticipantActions;

// ─────────────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────────────

const initialState: ParticipantState = {
  participantId: null,
  sessionId: null,
  nickname: null,
  teamId: null,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

/**
 * 참가자 스토어 (localStorage persist)
 *
 * 비로그인 참가자의 participantId, sessionId, nickname, teamId를 유지합니다.
 * 세션 이탈 또는 종료 시 clearParticipant()를 호출해 초기화합니다.
 */
export const useParticipantStore = create<ParticipantStore>()(
  persist(
    (set) => ({
      ...initialState,

      setParticipant: (response: JoinSessionResponse) =>
        set({
          participantId: response.participantId,
          sessionId: response.sessionId,
          nickname: response.nickname,
          teamId: response.teamId ?? null,
        }),

      clearParticipant: () => {
        set(initialState);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('knup-participant');
        }
      },
    }),
    {
      name: 'knup-participant',
    },
  ),
);
