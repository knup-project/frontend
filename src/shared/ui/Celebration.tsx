'use client';

/**
 * 정답 셀러브레이션 — 게임 모션 3종 ③ (환호).
 * RED + 골드 + 4지선다 색 조각이 화면을 가로질러 떨어집니다.
 * 결정적(index 기반) 배치라 SSR-안전하며 prefers-reduced-motion 시 렌더하지 않습니다.
 */
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';

const COLORS = ['#e60000', '#c9a227', '#1fa971', '#2d7ff9', '#7c4dff', '#f4b400'];

interface CelebrationProps {
  show: boolean;
  count?: number;
}

export function Celebration({ show, count = 28 }: CelebrationProps) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (i / count) * 100,
        color: COLORS[i % COLORS.length],
        delay: (i % 7) * 0.04,
        drift: ((i * 37) % 40) - 20,
        rotate: ((i * 53) % 360) + 540,
        duration: 1.1 + ((i * 13) % 50) / 100,
        width: 8 + (i % 3) * 3,
      })),
    [count],
  );

  if (reduce) return null;

  return (
    <AnimatePresence>
      {show && (
        <div
          aria-hidden
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}
        >
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, y: '-12vh', rotate: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: '112vh', rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                top: 0,
                left: `calc(${p.x}vw + ${p.drift}px)`,
                width: p.width,
                height: p.width * 1.4,
                borderRadius: 2,
                background: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
