/**
 * 퀴즈 편집
 * 사용 훅: useQuiz, useUpdateQuiz
 */
export default function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
      {/* TODO: QuizForm (편집 모드) */}
      <p style={{ color: '#6a6a6a' }}>퀴즈 편집 페이지</p>
    </main>
  );
}
