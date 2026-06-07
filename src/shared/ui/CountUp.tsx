'use client';

/**
 * 점수 카운트업 — 게임 모션 3종 ② (보상).
 * 이전 값 → 새 값으로 숫자를 굴립니다. prefers-reduced-motion 시 즉시 표시.
 */
import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ease } from '@/shared/lib/motion';

interface CountUpProps {
  value: number;
  /** 카운트업 길이(ms) */
  durationMs?: number;
  className?: string;
  /** 숫자 포맷터 (기본: 천단위 구분) — 안정성을 위해 useCallback 권장 */
  format?: (n: number) => string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString();

export function CountUp({ value, durationMs = 800, className, format }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = format ?? defaultFormat;

    if (reduce) {
      node.textContent = fmt(value);
      prev.current = value;
      return;
    }

    const controls = animate(prev.current, value, {
      duration: durationMs / 1000,
      ease: ease.out,
      onUpdate: (latest) => {
        node.textContent = fmt(latest);
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, durationMs, format, reduce]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {(format ?? defaultFormat)(0)}
    </span>
  );
}
