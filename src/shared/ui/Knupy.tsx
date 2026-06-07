'use client';

import { motion } from 'motion/react';

export type KnupyMood = 'idle' | 'happy' | 'sad' | 'thinking';

interface KnupyProps {
  /** 표정 — 긴장(thinking)/환호(happy)/위로(sad)/기본(idle) */
  mood?: KnupyMood;
  size?: number;
  /** 둥둥 떠다니는 모션 (기본 on) */
  float?: boolean;
  className?: string;
}

/**
 * 마스코트 크누피 — 경북대 별(첨성인) 모티브.
 * KNU Red 바디 + Gray 안테나 + 골드 별 포인트(별 = 정답 은유).
 * 표정으로 긴장/환호/위로를 전한다. prefers-reduced-motion 은 framer 가 자동 처리.
 */
export function Knupy({ mood = 'idle', size = 96, float = true, className }: KnupyProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="마스코트 크누피"
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } : undefined}
    >
      {/* 안테나 + 골드 별 */}
      <line x1="50" y1="22" x2="50" y2="31" stroke="#797977" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 7 L52.6 15 L61 15 L54.2 20 L56.8 28 L50 23 L43.2 28 L45.8 20 L39 15 L47.4 15 Z" fill="#c9a227" />

      {/* 그림자 */}
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="#000000" opacity="0.12" />

      {/* 발 */}
      <ellipse cx="40" cy="87" rx="7" ry="5" fill="#c00000" />
      <ellipse cx="60" cy="87" rx="7" ry="5" fill="#c00000" />

      {/* 바디 */}
      <circle cx="50" cy="58" r="32" fill="#e60000" />

      {/* 볼 */}
      <circle cx="33" cy="63" r="5" fill="#ff9a9a" opacity="0.75" />
      <circle cx="67" cy="63" r="5" fill="#ff9a9a" opacity="0.75" />

      {/* 표정 */}
      <Face mood={mood} />
    </motion.svg>
  );
}

function Face({ mood }: { mood: KnupyMood }) {
  if (mood === 'happy') {
    return (
      <>
        <path d="M36 55 q5 -6 10 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M54 55 q5 -6 10 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 63 q10 14 20 0 Z" fill="#ffffff" />
      </>
    );
  }
  if (mood === 'sad') {
    return (
      <>
        <circle cx="41" cy="56" r="3.5" fill="#ffffff" />
        <circle cx="59" cy="56" r="3.5" fill="#ffffff" />
        <path d="M63 59 q3 5 0 9" fill="none" stroke="#9ecbff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M43 71 q7 -6 14 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'thinking') {
    return (
      <>
        <circle cx="41" cy="56" r="3.5" fill="#ffffff" />
        <circle cx="59" cy="56" r="3.5" fill="#ffffff" />
        <circle cx="52" cy="68" r="3" fill="#ffffff" />
      </>
    );
  }
  // idle
  return (
    <>
      <circle cx="41" cy="56" r="4" fill="#ffffff" />
      <circle cx="42" cy="56.5" r="1.8" fill="#2a2a2a" />
      <circle cx="59" cy="56" r="4" fill="#ffffff" />
      <circle cx="60" cy="56.5" r="1.8" fill="#2a2a2a" />
      <path d="M43 65 q7 7 14 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}
