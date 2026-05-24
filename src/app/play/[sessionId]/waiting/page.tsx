/**
 * 세션 대기실 (참가자)
 * 사용 훅: useSession, useSessionSocket
 */
export default function PlayWaitingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen p-4">
      {/* TODO: WaitingRoom 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>세션 대기 중...</p>
    </main>
  );
}
