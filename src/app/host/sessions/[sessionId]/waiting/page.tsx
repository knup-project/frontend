/**
 * 세션 대기실 (호스트)
 * 사용 훅: useSession, useSessionSocket, useStartSession
 */
export default function HostWaitingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 p-4 md:p-8">
      {/* TODO: ParticipantList, PinDisplay, StartButton 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>세션 대기실 (호스트)</p>
    </main>
  );
}
