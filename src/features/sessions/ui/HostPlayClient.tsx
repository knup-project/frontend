'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, useNextQuestion, useEndSession } from '../hooks';
import { useSessionSocket } from '../socket/hooks';
import { useLeaderboard, updateLeaderboardCache } from '@/features/leaderboard/hooks';
import { useQueryClient } from '@tanstack/react-query';
import type { SessionQuestionEvent, SessionResultEvent } from '@/shared/types/api';

export function HostPlayClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession(sessionId);
  const { mutate: nextQuestion, isPending: isMoving } = useNextQuestion();
  const { mutate: endSession, isPending: isEnding } = useEndSession();
  const { data: leaderboard } = useLeaderboard(sessionId, 5);

  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestionEvent | null>(null);
  const [result, setResult] = useState<SessionResultEvent | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const { connected } = useSessionSocket({
    sessionId,
    onQuestion: (e) => {
      setCurrentQuestion(e);
      setResult(null);
      setAnsweredCount(0);
    },
    onResult: (e) => {
      setResult(e);
      setAnsweredCount(e.answeredCount);
    },
    onLeaderboard: (e) => {
      updateLeaderboardCache(queryClient, sessionId, e, 5);
    },
    onStatus: (e) => {
      if (e.status === 'FINISHED') {
        router.push(`/host/sessions/${sessionId}/result`);
      }
    },
  });

  const handleNext = () => {
    if (!session) return;
    const isLast =
      (session.currentQuestionIndex + 1) >= session.totalQuestions;

    if (isLast) {
      endSession(sessionId, {
        onSuccess: () => router.push(`/host/sessions/${sessionId}/result`),
      });
    } else {
      nextQuestion(sessionId);
    }
  };

  const totalQ = session?.totalQuestions ?? 0;
  const currentIdx = session?.currentQuestionIndex ?? 0;
  const progress = totalQ > 0 ? ((currentIdx + 1) / totalQ) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#222222] flex flex-col">
      {/* 상단 바 */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? '#22c55e' : '#929292' }}
          />
          <span style={{ color: 'white', fontWeight: 600 }}>
            {session?.quizTitle}
          </span>
        </div>
        <span style={{ fontSize: '14px', color: '#929292' }}>
          문제 {currentIdx + 1} / {totalQ}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-[#333333]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
        />
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* 좌: 현재 문제 + 통계 */}
        <div className="flex-1 flex flex-col gap-4">
          {currentQuestion ? (
            <>
              {/* 문제 카드 */}
              <div
                className="rounded-[14px] p-6"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <p style={{ fontSize: '13px', color: '#929292', marginBottom: '12px' }}>
                  {currentQuestion.question.type === 'MULTIPLE_CHOICE' ? '객관식' :
                   currentQuestion.question.type === 'TRUE_FALSE' ? 'O/X' : '단답형'} ·{' '}
                  {currentQuestion.question.timeLimit}초 · {currentQuestion.question.points}점
                </p>
                <p style={{ fontSize: '22px', fontWeight: 600, color: 'white', lineHeight: 1.4 }}>
                  {currentQuestion.question.content}
                </p>

                {currentQuestion.question.options && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {currentQuestion.question.options.map((opt, i) => (
                      <div
                        key={i}
                        className="rounded-[8px] p-3"
                        style={{
                          background: result?.correctAnswer === opt
                            ? '#22c55e'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '15px',
                        }}
                      >
                        {i + 1}. {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 답변 통계 */}
              {result && (
                <div
                  className="rounded-[14px] p-5"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <p style={{ fontSize: '14px', color: '#929292', marginBottom: '12px' }}>
                    답변 결과
                  </p>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>
                        {answeredCount}
                      </p>
                      <p style={{ fontSize: '12px', color: '#929292' }}>제출</p>
                    </div>
                    <div className="text-center">
                      <p style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>
                        {Math.round(result.accuracy * 100)}%
                      </p>
                      <p style={{ fontSize: '12px', color: '#929292' }}>정답률</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p style={{ color: '#929292' }}>첫 문제를 시작하세요</p>
            </div>
          )}

          {/* 다음 문제 / 종료 버튼 */}
          <button
            onClick={handleNext}
            disabled={isMoving || isEnding}
            style={{
              height: '56px',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: '18px', fontWeight: 700,
              borderRadius: '9999px', border: 'none',
              cursor: isMoving || isEnding ? 'not-allowed' : 'pointer',
              opacity: isMoving || isEnding ? 0.7 : 1,
            }}
          >
            {isMoving || isEnding
              ? '처리 중...'
              : (currentIdx + 1) >= totalQ
              ? '퀴즈 종료'
              : currentQuestion
              ? '다음 문제 →'
              : '첫 문제 시작'}
          </button>
        </div>

        {/* 우: 실시간 리더보드 */}
        <div
          className="w-64 rounded-[14px] p-5 flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
            실시간 순위 TOP 5
          </p>
          {leaderboard?.entries.map((entry, i) => (
            <div key={entry.participantId} className="flex items-center gap-3">
              <span
                style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '12px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: '14px', color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.nickname}
              </span>
              <span style={{ fontSize: '13px', color: '#929292' }}>
                {entry.totalPoints}pt
              </span>
            </div>
          ))}
          {(!leaderboard?.entries || leaderboard.entries.length === 0) && (
            <p style={{ fontSize: '13px', color: '#929292' }}>아직 점수 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
