'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Knupy } from '@/shared/ui/Knupy';
import { fadeUp, staggerChildren } from '@/shared/lib/motion';

/**
 * 랜딩 페이지 — "Warm Arcade" (경북대 + 아케이드 + 크누피)
 *
 * 로그인한 사용자 → /dashboard/quizzes
 * 비로그인 참가자 → /join
 */

// ─── 커스텀 SVG 픽토 (이모지 대신) ──────────────────
type IconProps = { className?: string };
const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconKey = (p: IconProps) => (
  <svg {...svgBase} className={p.className}>
    <circle cx="8" cy="8" r="4" />
    <path d="M11 11l8 8M16 16l2-2M19 19l2-2" />
  </svg>
);
const IconCheck = (p: IconProps) => (
  <svg {...svgBase} className={p.className}>
    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);
const IconTrophy = (p: IconProps) => (
  <svg {...svgBase} className={p.className}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 18h6M10 18v-2M14 18v-2M8 21h8" />
  </svg>
);
const IconBolt = (p: IconProps) => (
  <svg {...svgBase} className={p.className}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
const IconSparkle = (p: IconProps) => (
  <svg {...svgBase} className={p.className}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M19 15l.7 2 .3.1M5 4l.6 1.7" />
  </svg>
);

// 배경 장식용 별/도형
function Star({ size = 24, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l2.4 6.6L21 9.6l-5.4 4.2L17.4 21 12 17.1 6.6 21l1.8-7.2L3 9.6l6.6-1z" />
    </svg>
  );
}

const STEPS = [
  { n: 1, color: 'var(--choice-blue)', title: 'PIN으로 입장', desc: '호스트가 띄운 PIN만 입력하면 끝. 가입 없이 바로 참가해요.', icon: <IconKey className="w-7 h-7" /> },
  { n: 2, color: 'var(--color-correct)', title: '실시간으로 풀기', desc: '모두 같은 화면에서 동시에. 타이머 링이 돌고 즉시 채점됩니다.', icon: <IconCheck className="w-7 h-7" /> },
  { n: 3, color: 'var(--color-gold)', title: '순위로 환호', desc: '점수가 차오르고 순위가 뒤집히는 골드 시상대에서 마무리.', icon: <IconTrophy className="w-7 h-7" /> },
];

const FEATURES = [
  { color: 'var(--choice-blue)', title: '실시간 라이브', desc: 'PIN 입장·동시 풀이·타이머·즉각 피드백까지, 강의실이 들썩여요.', icon: <IconBolt className="w-7 h-7" /> },
  { color: 'var(--choice-purple)', title: 'AI 문제 생성', desc: '강의 노트나 PDF를 붙여넣으면 Gemini가 문제 초안을 만들어 줘요.', icon: <IconSparkle className="w-7 h-7" /> },
  { color: 'var(--color-gold)', title: '골드 리더보드', desc: '점수 카운트업과 순위 변동, 1등 골드 시상으로 끝까지 긴장감 있게.', icon: <IconTrophy className="w-7 h-7" /> },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* 상단 미니 헤더 */}
      <header className="absolute top-0 inset-x-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-2xl" style={{ color: 'var(--color-primary)' }}>
            크누피
          </span>
          <Link href="/login" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--color-ink)' }}>
            호스트 로그인 →
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="bg-dots relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* 배경 별/도형 */}
        <motion.div className="absolute left-[10%] top-[20%]" animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}>
          <Star size={28} color="var(--choice-blue)" />
        </motion.div>
        <motion.div className="absolute right-[12%] top-[26%]" animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}>
          <Star size={20} color="var(--color-gold)" />
        </motion.div>
        <motion.div className="absolute left-[16%] bottom-[22%]" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}>
          <Star size={18} color="var(--choice-purple)" />
        </motion.div>
        <motion.div className="absolute right-[16%] bottom-[26%]" animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}>
          <Star size={24} color="var(--color-correct)" />
        </motion.div>

        <motion.div className="relative flex flex-col items-center text-center max-w-2xl" variants={staggerChildren} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <Knupy mood="happy" size={148} />
          </motion.div>
          <motion.span variants={fadeUp} className="chip mt-2" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
            경북대학교 실시간 퀴즈
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display text-7xl mt-4 mb-4" style={{ color: 'var(--color-primary)' }}>
            크누피
          </motion.h1>
          <motion.p variants={fadeUp} className="text-2xl mb-3 font-bold" style={{ color: 'var(--color-ink)' }}>
            강의실을 깨우는 실시간 퀴즈
          </motion.p>
          <motion.p variants={fadeUp} className="text-base mb-8" style={{ color: 'var(--color-muted)' }}>
            PIN 하나로 입장하고, 다 같이 풀고, 순위로 환호하세요.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link href="/join" className="btn-arcade no-underline justify-center">
              퀴즈 참가하기
            </Link>
            <Link
              href="/login"
              className="btn-arcade no-underline justify-center"
              style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}
            >
              호스트로 시작
            </Link>
          </motion.div>
        </motion.div>

        <div aria-hidden className="absolute bottom-8 text-sm" style={{ color: 'var(--color-muted-soft)' }}>
          아래로 둘러보기 ↓
        </div>
      </section>

      {/* 어떻게 작동하나 — 3스텝 */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center mb-3" style={{ color: 'var(--color-ink)' }}>
            이렇게 즐겨요
          </h2>
          <p className="text-center mb-14" style={{ color: 'var(--color-muted)' }}>
            세 단계면 충분합니다.
          </p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="card-arcade card-arcade-interactive p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center justify-center"
                    style={{ width: 56, height: 56, borderRadius: 14, background: s.color, border: '2px solid var(--color-ink)', boxShadow: 'var(--shadow-hard-sm)', color: '#fff' }}
                  >
                    {s.icon}
                  </div>
                  <span className="font-display text-5xl" style={{ color: 'var(--color-hairline)' }}>
                    {s.n}
                  </span>
                </div>
                <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 특징 */}
      <section className="px-6 py-24" style={{ background: 'var(--color-surface-soft)', borderTop: '2px solid var(--color-ink)', borderBottom: '2px solid var(--color-ink)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center mb-3" style={{ color: 'var(--color-ink)' }}>
            강의가 게임이 됩니다
          </h2>
          <p className="text-center mb-14" style={{ color: 'var(--color-muted)' }}>
            호스트는 빠르게 만들고, 참가자는 즐겁게 풉니다.
          </p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="card-arcade card-arcade-interactive p-6 flex flex-col gap-3">
                <div
                  className="inline-flex items-center justify-center"
                  style={{ width: 56, height: 56, borderRadius: 14, background: f.color, border: '2px solid var(--color-ink)', boxShadow: 'var(--shadow-hard-sm)', color: '#fff' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
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

      {/* CTA 밴드 — KNU Red 풀블리드 */}
      <section className="px-6 py-20" style={{ background: 'var(--color-primary)' }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-5">
          <Knupy mood="idle" size={88} />
          <h2 className="font-display text-4xl" style={{ color: '#fff' }}>
            지금 시작해볼까요?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>
            호스트는 무료로 퀴즈를 만들고 세션을 열 수 있어요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link href="/join" className="btn-arcade no-underline justify-center" style={{ background: '#fff', color: 'var(--color-primary)' }}>
              퀴즈 참가하기
            </Link>
            <Link href="/login" className="btn-arcade no-underline justify-center" style={{ background: 'var(--stage-ink)', color: '#fff' }}>
              호스트 로그인
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="px-6 py-8 text-center text-sm" style={{ color: 'var(--color-muted-soft)' }}>
        크누피 · 경북대학교 실시간 퀴즈 플랫폼
      </footer>
    </main>
  );
}
