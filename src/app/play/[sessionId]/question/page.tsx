/**
 * 문제 풀기 (참가자)
 * 사용 훅: useSessionSocket, useSubmitAnswer
 */
export default function PlayQuestionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4">
      {/* TODO: QuestionCard, AnswerOptions, Timer 컴포넌트 */}
      <p style={{ color: '#6a6a6a' }}>문제 풀기</p>
    </main>
  );
}
