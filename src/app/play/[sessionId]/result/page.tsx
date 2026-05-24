/**
 * 문제 결과 (참가자)
 * 사용 훅: useSessionSocket
 */
export default function PlayResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4">
      {/* TODO: AnswerResult, ScoreDisplay 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>결과 확인</p>
    </main>
  );
}
