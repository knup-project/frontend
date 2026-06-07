'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGenerateQuizFromText, useGenerateQuizFromPdf } from '../hooks';
import { useCreateQuiz } from '@/features/quizzes/hooks';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AIQuestionType, Difficulty } from '@/shared/types/api';

type Tab = 'text' | 'pdf';

export function AiGenerateClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState<AIQuestionType>('MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [errorMsg, setErrorMsg] = useState('');

  const { mutate: fromText, isPending: isTextPending, data: textResult } = useGenerateQuizFromText();
  const { mutate: fromPdf, isPending: isPdfPending, data: pdfResult } = useGenerateQuizFromPdf();
  const { mutate: createQuiz, isPending: isSaving } = useCreateQuiz();

  const isPending = isTextPending || isPdfPending;
  const result = textResult ?? pdfResult;

  const handleGenerate = () => {
    setErrorMsg('');
    if (tab === 'text') {
      if (!text.trim()) return;
      fromText(
        { text, questionCount, questionType, difficulty },
        { onError: (err) => setErrorMsg(getApiErrorMessage(err)) },
      );
    } else {
      if (!file) return;
      fromPdf(
        { file, questionCount, questionType, difficulty },
        { onError: (err) => setErrorMsg(getApiErrorMessage(err)) },
      );
    }
  };

  const handleSave = () => {
    if (!result) return;
    createQuiz(
      { title: 'AI 생성 퀴즈', questions: result.questions },
      { onSuccess: () => router.push('/dashboard/quizzes') },
    );
  };

  const labelStyle = { fontSize: 14, fontWeight: 600, color: 'var(--color-muted)' } as const;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quizzes" style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          ← 내 퀴즈
        </Link>
        <span style={{ color: 'var(--color-hairline)' }}>/</span>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
          AI 퀴즈 생성
        </h1>
        <span className="chip" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
          ✨ Gemini
        </span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-[10px] p-1 w-fit" style={{ background: 'var(--color-surface-strong)' }}>
        {(['text', 'pdf'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: tab === t ? 'var(--color-canvas)' : 'transparent',
              color: tab === t ? 'var(--color-ink)' : 'var(--color-muted)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: tab === t ? 'var(--elev-1)' : 'none',
            }}
          >
            {t === 'text' ? '텍스트 입력' : 'PDF 업로드'}
          </button>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="card p-6 flex flex-col gap-5">
        {tab === 'text' ? (
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>학습 내용 텍스트 *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="퀴즈로 만들 내용을 붙여넣으세요…"
              rows={8}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid var(--color-hairline)',
                borderRadius: 10,
                fontSize: 14,
                color: 'var(--color-ink)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>PDF 파일 *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 14, color: 'var(--color-ink)' }}
            />
            {file && <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{file.name}</p>}
          </div>
        )}

        {/* 옵션 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>문제 수</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="input-text"
              style={{ height: 44, padding: '0 12px' }}
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}개
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>유형</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as AIQuestionType)}
              className="input-text"
              style={{ height: 44, padding: '0 12px' }}
            >
              <option value="MULTIPLE_CHOICE">객관식</option>
              <option value="TRUE_FALSE">O/X</option>
              <option value="MIXED">혼합</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>난이도</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="input-text"
              style={{ height: 44, padding: '0 12px' }}
            >
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
            </select>
          </div>
        </div>

        {errorMsg && <p style={{ fontSize: 14, color: 'var(--color-error)' }}>{errorMsg}</p>}

        <button
          onClick={handleGenerate}
          disabled={isPending || (tab === 'text' ? !text.trim() : !file)}
          className="btn-primary"
        >
          {isPending ? 'AI 생성 중…' : '퀴즈 생성하기'}
        </button>
      </div>

      {/* 생성 결과 미리보기 */}
      {result && (
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
              생성된 문제 ({result.questions.length}개)
            </h2>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
              style={{ height: 36, padding: '0 16px', fontSize: 14 }}
            >
              {isSaving ? '저장 중…' : '퀴즈로 저장'}
            </button>
          </div>

          {/* AI 신뢰 안내 — 투명성(검토 유도) */}
          <div className="flex items-center gap-2 rounded-[10px] p-3" style={{ background: 'var(--color-primary-tint)' }}>
            <span aria-hidden>✨</span>
            <p className="text-sm" style={{ color: 'var(--color-body)' }}>
              AI가 만든 초안이에요. 내용을 확인하고 저장하세요.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {result.questions.map((q, i) => (
              <div
                key={i}
                className="p-4 rounded-[12px]"
                style={{ background: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {i + 1}. {q.content}
                </p>
                {q.options && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {q.options.map((opt, oi) => {
                      const isAnswer = opt === q.answer;
                      return (
                        <li
                          key={oi}
                          className="text-sm flex items-center gap-1.5"
                          style={{ color: isAnswer ? 'var(--color-correct)' : 'var(--color-body)', fontWeight: isAnswer ? 600 : 400 }}
                        >
                          {isAnswer && <span aria-hidden>✓</span>}
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                  정답: <span style={{ color: 'var(--color-correct)', fontWeight: 600 }}>{q.answer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
