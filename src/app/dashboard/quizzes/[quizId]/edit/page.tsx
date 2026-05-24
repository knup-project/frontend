import { EditQuizClient } from '@/features/quizzes/ui/EditQuizClient';

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  return <EditQuizClient quizId={Number(quizId)} />;
}
