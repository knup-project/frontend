/**
 * 세션 진행 (호스트)
 * 사용 훅: useSession, useSessionSocket, useNextQuestion, useLeaderboard
 */
export default function HostPlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 p-4 md:p-8">
      {/* TODO: QuestionDisplay, AnswerStats, LiveLeaderboard 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>세션 진행 화면 (호스트)</p>
    </main>
  );
}
