'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, useNextQuestion, useEndSession } from '../hooks';
import { useSessionSocket } from '../socket/hooks';
import { useLeaderboard, updateLeaderboardCache } from '@/features/leaderboard/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { CountUp } from '@/shared/ui/CountUp';
import type { SessionQuestionEvent, SessionResultEvent } from '@/shared/types/api';

export function HostPlayClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession(sessionId);
  const { mutate: nextQuestion, isPending: isMoving } = useNextQuestion();
  const { mutate: endSession, isPending: isEnding } = useEndSession();
  const { data: leaderboard } = useLeaderboard(sessionId, 5);

  const [wsQuestion, setWsQuestion] = useState<SessionQuestionEvent | null>(null);
  const [result, setResult] = useState<SessionResultEvent | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const { connected } = useSessionSocket({
    sessionId,
    onQuestion: (e) => {
      setWsQuestion(e);
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

  // WS question 이벤트를 놓친 경우(새로고침/구독 공백) 세션 조회의
  // currentQuestion 스냅샷으로 복구한다. 둘 다 있으면 더 나중 문제를 보여 준다.
  const recoveredQuestion: SessionQuestionEvent | null =
    session?.currentQuestion && session.status === 'IN_PROGRESS'
      ? {
          sessionId,
          questionIndex: session.currentQuestionIndex,
          totalQuestions: session.totalQuestions,
          question: session.currentQuestion,
          startedAt: '',
        }
      : null;
  const currentQuestion =
    wsQuestion && recoveredQuestion
      ? (wsQuestion.questionIndex >= recoveredQuestion.questionIndex ? wsQuestion : recoveredQuestion)
      : (wsQuestion ?? recoveredQuestion);

  // 마지막 문제 판정은 "실제로 송출된 문제" 기준이어야 한다.
  // 세션 스냅샷의 currentQuestionIndex 는 송출 전에도 0 이라, 1문제짜리
  // 퀴즈에서 첫 문제를 내보내기도 전에 '퀴즈 종료'가 되어 버린다.
  const isLast =
    currentQuestion !== null &&
    currentQuestion.questionIndex + 1 >= currentQuestion.totalQuestions;

  const handleNext = () => {
    if (!session) return;

    if (isLast) {
      endSession(sessionId, {
        onSuccess: () => router.push(`/host/sessions/${sessionId}/result`),
      });
    } else {
      nextQuestion(sessionId);
    }
  };

  const totalQ = session?.totalQuestions ?? 0;
  const currentIdx = currentQuestion?.questionIndex ?? session?.currentQuestionIndex ?? 0;
  const served = currentQuestion !== null;
  const progress = totalQ > 0 && served ? ((currentIdx + 1) / totalQ) * 100 : 0;

  return (
    <div className="stage min-h-screen flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? 'var(--color-correct)' : 'var(--stage-muted)' }}
          />
          <span className="font-semibold" style={{ color: 'var(--stage-text)' }}>
            {session?.quizTitle}
          </span>
        </div>
        <span className="tabular text-sm" style={{ color: 'var(--stage-muted)' }}>
          문제 {served ? currentIdx + 1 : '-'} / {totalQ}
        </span>
      </div>

      {/* 진행 바 — 네온 */}
      <div className="h-1" style={{ background: 'var(--stage-border)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--color-primary)', boxShadow: '0 0 12px rgba(230,0,0,0.6)' }}
        />
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* 좌: 현재 문제 + 통계 */}
        <div className="flex-1 flex flex-col gap-4">
          {currentQuestion ? (
            <>
              {/* 문제 카드 */}
              <div className="stage-card p-6">
                <p className="text-sm mb-3" style={{ color: 'var(--stage-muted)' }}>
                  {currentQuestion.question.type === 'MULTIPLE_CHOICE'
                    ? '객관식'
                    : currentQuestion.question.type === 'TRUE_FALSE'
                      ? 'O/X'
                      : '단답형'}{' '}
                  · {currentQuestion.question.timeLimit}초 · {currentQuestion.question.points}점
                </p>
                <p className="text-2xl font-semibold leading-snug" style={{ color: 'var(--stage-text)' }}>
                  {currentQuestion.question.content}
                </p>

                {currentQuestion.question.options && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {currentQuestion.question.options.map((opt, i) => {
                      const isAnswer = result?.correctAnswer === opt;
                      return (
                        <div
                          key={i}
                          className="rounded-xl p-3 text-sm flex items-center gap-2"
                          style={{
                            background: isAnswer ? 'var(--color-correct)' : 'rgba(255,255,255,0.07)',
                            color: '#fff',
                            boxShadow: isAnswer ? 'var(--glow-correct)' : 'none',
                            fontWeight: isAnswer ? 700 : 500,
                          }}
                        >
                          {isAnswer && <span aria-hidden>✓</span>}
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 답변 통계 */}
              {result && (
                <div className="stage-card p-5">
                  <p className="text-sm mb-3" style={{ color: 'var(--stage-muted)' }}>
                    답변 결과
                  </p>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold tabular" style={{ color: 'var(--stage-text)' }}>
                        <CountUp value={answeredCount} />
                      </p>
                      <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>제출</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold tabular" style={{ color: 'var(--color-correct)' }}>
                        <CountUp value={Math.round(result.accuracy * 100)} />%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--stage-muted)' }}>정답률</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--stage-border)' }}
            >
              <p style={{ color: 'var(--stage-muted)' }}>첫 문제를 시작하세요</p>
            </div>
          )}

          {/* 다음 문제 / 종료 버튼 */}
          <button
            onClick={handleNext}
            disabled={isMoving || isEnding}
            className="btn-primary"
            style={{ height: 56, fontSize: 18, fontWeight: 800, borderRadius: 9999 }}
          >
            {isMoving || isEnding
              ? '처리 중…'
              : !currentQuestion
                ? '첫 문제 시작'
                : isLast
                  ? '퀴즈 종료'
                  : '다음 문제 →'}
          </button>
        </div>

        {/* 우: 실시간 리더보드 */}
        <div className="w-64 stage-card p-5 flex flex-col gap-3" style={{ flexShrink: 0 }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--stage-text)' }}>
            실시간 순위 TOP 5
          </p>
          {leaderboard?.entries.map((entry, i) => (
            <div key={entry.participantId} className="flex items-center gap-3">
              <span
                className="tabular"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
                  color: i === 0 ? '#2a2a2a' : '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm flex-1 truncate"
                style={{ color: 'var(--stage-text)' }}
              >
                {entry.nickname}
              </span>
              <span className="text-sm tabular" style={{ color: i === 0 ? 'var(--color-gold)' : 'var(--stage-muted)' }}>
                {entry.totalPoints}pt
              </span>
            </div>
          ))}
          {(!leaderboard?.entries || leaderboard.entries.length === 0) && (
            <p className="text-sm" style={{ color: 'var(--stage-muted)' }}>
              아직 점수 없음
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
