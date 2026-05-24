'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateSession } from '../hooks';
import { useMyQuizzes } from '@/features/quizzes/hooks';
import { getApiErrorMessage } from '@/shared/api/error';
import type { SessionMode } from '@/shared/types/api';

export function NewSessionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetQuizId = searchParams.get('quizId');

  const { data: quizzes } = useMyQuizzes({ size: 50 });
  const { mutate: createSession, isPending } = useCreateSession();

  const [quizId, setQuizId] = useState<number | ''>(
    presetQuizId ? Number(presetQuizId) : '',
  );
  const [mode, setMode] = useState<SessionMode>('INDIVIDUAL');
  const [teamCount, setTeamCount] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;
    setErrorMsg('');

    createSession(
      {
        quizId: Number(quizId),
        mode,
        teamCount: mode === 'TEAM' ? teamCount : undefined,
        maxParticipants,
      },
      {
        onSuccess: (session) =>
          router.push(`/host/sessions/${session.id}/waiting`),
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      },
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f7f7f7] p-4">
      <div className="w-full max-w-md bg-white rounded-[14px] border border-[#dddddd] p-8">
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#222222' }} className="mb-6">
          세션 만들기
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 퀴즈 선택 */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
              퀴즈 선택 *
            </label>
            <select
              required
              value={quizId}
              onChange={(e) => setQuizId(Number(e.target.value))}
              className="input-text"
              style={{ height: '56px', padding: '0 12px' }}
            >
              <option value="">퀴즈를 선택하세요</option>
              {quizzes?.content.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.questionCount}문제)
                </option>
              ))}
            </select>
          </div>

          {/* 모드 선택 */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
              진행 방식
            </label>
            <div className="flex gap-3">
              {(['INDIVIDUAL', 'TEAM'] as SessionMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, height: '48px',
                    borderRadius: '8px', fontSize: '15px', fontWeight: 500,
                    border: mode === m ? '2px solid #ff385c' : '1px solid #dddddd',
                    background: mode === m ? '#fff5f7' : 'white',
                    color: mode === m ? '#ff385c' : '#222222',
                    cursor: 'pointer',
                  }}
                >
                  {m === 'INDIVIDUAL' ? '개인전' : '팀전'}
                </button>
              ))}
            </div>
          </div>

          {/* 팀 수 (팀전일 때) */}
          {mode === 'TEAM' && (
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>팀 수</label>
              <input
                type="number"
                min={2}
                max={10}
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="input-text"
              />
            </div>
          )}

          {/* 최대 인원 */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
              최대 참가자
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="input-text"
            />
          </div>

          {errorMsg && (
            <p style={{ fontSize: '14px', color: '#c13515' }}>{errorMsg}</p>
          )}

          <button type="submit" disabled={isPending} className="btn-primary mt-2">
            {isPending ? '생성 중...' : '세션 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
