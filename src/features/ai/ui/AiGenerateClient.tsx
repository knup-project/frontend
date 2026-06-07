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
      fromText({ text, questionCount, questionType, difficulty }, {
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      });
    } else {
      if (!file) return;
      fromPdf({ file, questionCount, questionType, difficulty }, {
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      });
    }
  };

  const handleSave = () => {
    if (!result) return;
    createQuiz(
      { title: 'AI 생성 퀴즈', questions: result.questions },
      { onSuccess: () => router.push('/dashboard/quizzes') },
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quizzes" style={{ color: '#6a6a6a', fontSize: '14px' }}>
          ← 내 퀴즈
        </Link>
        <span style={{ color: '#dddddd' }}>/</span>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>AI 퀴즈 생성</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-[#f2f2f2] rounded-[8px] p-1 w-fit">
        {(['text', 'pdf'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#222222' : '#6a6a6a',
              border: 'none',
              cursor: 'pointer',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t === 'text' ? '텍스트 입력' : 'PDF 업로드'}
          </button>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="bg-white rounded-[14px] border border-[#dddddd] p-6 flex flex-col gap-5">
        {tab === 'text' ? (
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
              학습 내용 텍스트 *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="퀴즈로 만들 내용을 붙여넣으세요..."
              rows={8}
              style={{
                width: '100%', padding: '12px',
                border: '1px solid #dddddd', borderRadius: '8px',
                fontSize: '14px', color: '#222222',
                outline: 'none', resize: 'vertical',
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>
              PDF 파일 *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: '14px', color: '#222222' }}
            />
            {file && (
              <p style={{ fontSize: '13px', color: '#6a6a6a' }}>{file.name}</p>
            )}
          </div>
        )}

        {/* 옵션 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>문제 수</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="input-text"
              style={{ height: '44px', padding: '0 12px' }}
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n}개</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>유형</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as AIQuestionType)}
              className="input-text"
              style={{ height: '44px', padding: '0 12px' }}
            >
              <option value="MULTIPLE_CHOICE">객관식</option>
              <option value="TRUE_FALSE">O/X</option>
              <option value="MIXED">혼합</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#6a6a6a' }}>난이도</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="input-text"
              style={{ height: '44px', padding: '0 12px' }}
            >
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <p style={{ fontSize: '14px', color: '#c13515' }}>{errorMsg}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={isPending || (tab === 'text' ? !text.trim() : !file)}
          className="btn-primary"
        >
          {isPending ? 'AI 생성 중...' : '퀴즈 생성하기'}
        </button>
      </div>

      {/* 생성 결과 미리보기 */}
      {result && (
        <div className="bg-white rounded-[14px] border border-[#dddddd] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#222222' }}>
              생성된 문제 ({result.questions.length}개)
            </h2>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
              style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}
            >
              {isSaving ? '저장 중...' : '퀴즈로 저장'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {result.questions.map((q, i) => (
              <div
                key={i}
                className="p-4 rounded-[8px]"
                style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
              >
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#222222' }}>
                  {i + 1}. {q.content}
                </p>
                {q.options && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {q.options.map((opt, oi) => (
                      <li
                        key={oi}
                        style={{
                          fontSize: '13px',
                          color: opt === q.answer ? 'var(--color-primary)' : '#3f3f3f',
                          fontWeight: opt === q.answer ? 600 : 400,
                        }}
                      >
                        {oi + 1}. {opt}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2" style={{ fontSize: '13px', color: '#6a6a6a' }}>
                  정답: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{q.answer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
