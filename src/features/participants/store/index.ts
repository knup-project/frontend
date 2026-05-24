'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JoinSessionResponse } from '@/shared/types/api';

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

const initialState: ParticipantState = {
  participantId: null,
  sessionId: null,
  nickname: null,
  teamId: null,
};

/**
 * 참가자 스토어 (localStorage persist)
 *
 * 비로그인 참가자의 세션 정보를 유지합니다.
 * 스토리지 키: "knup-participant"
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
    { name: 'knup-participant' },
  ),
);
