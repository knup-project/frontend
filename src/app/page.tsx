'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Knupy } from '@/shared/ui/Knupy';
import { fadeUp, staggerChildren } from '@/shared/lib/motion';

/**
 * 랜딩 페이지
 *
 * 로그인한 사용자 → /dashboard/quizzes
 * 비로그인 참가자 → /join
 */

const FEATURES = [
  { icon: '⚡', title: '실시간', desc: 'PIN으로 입장해 다 같이 푸는 라이브 퀴즈. 타이머 링과 즉각 피드백.' },
  { icon: '✨', title: 'AI 생성', desc: '강의 노트나 PDF를 붙여넣으면 Gemini가 문제를 만들어 줍니다.' },
  { icon: '🏆', title: '리더보드', desc: '점수 카운트업과 골드 시상대로 마지막까지 긴장감 있게.' },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* 히어로 */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(230,0,0,0.10), transparent 70%)' }}
        />

        <motion.div
          className="flex flex-col items-center text-center max-w-2xl"
          variants={staggerChildren}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <Knupy mood="happy" size={140} />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-6xl font-extrabold mt-2 mb-4"
            style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}
          >
            크누피
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl mb-2 font-semibold" style={{ color: 'var(--color-ink)' }}>
            경북대 강의실을 깨우는 실시간 퀴즈
          </motion.p>
          <motion.p variants={fadeUp} className="text-base mb-8" style={{ color: 'var(--color-muted)' }}>
            PIN 하나로 입장하고, 다 같이 풀고, 순위로 환호하세요.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link href="/join" className="btn-primary no-underline" style={{ padding: '0 32px' }}>
              퀴즈 참가하기
            </Link>
            <Link href="/login" className="btn-secondary no-underline" style={{ padding: '0 32px' }}>
              호스트로 시작
            </Link>
          </motion.div>
        </motion.div>

        <div aria-hidden className="absolute bottom-8 text-sm" style={{ color: 'var(--color-muted-soft)' }}>
          아래로 둘러보기 ↓
        </div>
      </section>

      {/* 특징 */}
      <section className="px-6 py-20" style={{ background: 'var(--color-surface-soft)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-3" style={{ color: 'var(--color-ink)' }}>
            강의가 게임이 됩니다
          </h2>
          <p className="text-center mb-12" style={{ color: 'var(--color-muted)' }}>
            호스트는 빠르게 만들고, 참가자는 즐겁게 풉니다.
          </p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={staggerChildren}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="card p-6 flex flex-col gap-3">
                <div
                  className="inline-flex items-center justify-center"
                  style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary-tint)', fontSize: 24 }}
                  aria-hidden
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="px-6 py-20 text-center flex flex-col items-center">
        <Knupy mood="idle" size={80} />
        <h2 className="text-3xl font-extrabold mt-4 mb-3" style={{ color: 'var(--color-ink)' }}>
          지금 시작해볼까요?
        </h2>
        <p className="mb-8" style={{ color: 'var(--color-muted)' }}>
          호스트는 무료로 퀴즈를 만들고 세션을 열 수 있어요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link href="/join" className="btn-primary no-underline" style={{ padding: '0 32px' }}>
            퀴즈 참가하기
          </Link>
          <Link href="/login" className="btn-secondary no-underline" style={{ padding: '0 32px' }}>
            호스트 로그인
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ borderTop: '1px solid var(--color-hairline)', color: 'var(--color-muted-soft)' }}
      >
        크누피 · 경북대학교 실시간 퀴즈 플랫폼
      </footer>
    </main>
  );
}
