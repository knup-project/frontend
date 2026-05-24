/**
 * 세션 결과 (호스트)
 * 사용 훅: useEndSession, useLeaderboard, useSessionStats
 */
export default function HostResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 p-4 md:p-8">
      {/* TODO: FinalLeaderboard, SessionStats 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>세션 결과 (호스트)</p>
    </main>
  );
}
