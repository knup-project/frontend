'use client';

/**
 * 타이머 카운트다운 링 — 게임 모션 3종 ① (긴장).
 * progress(남은 비율 0~1)에 따라 원호가 줄고, 임박하면 색이 바뀝니다.
 */
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { ease } from '@/shared/lib/motion';

interface CountdownRingProps {
  /** 남은 시간 비율 0~1 (1 = 가득) */
  progress: number;
  /** 가운데 표시 (예: 남은 초) */
  label?: ReactNode;
  size?: number;
  stroke?: number;
  /** 트랙(배경 원) 색 — 다크 무대에서는 stage-border 권장 */
  trackColor?: string;
  /** 가운데 텍스트 색 — 다크 무대에서는 stage-text 권장 */
  textColor?: string;
  className?: string;
}

export function CountdownRing({
  progress,
  label,
  size = 120,
  stroke = 10,
  trackColor = 'var(--color-hairline)',
  textColor = 'var(--color-ink)',
  className,
}: CountdownRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const urgent = clamped <= 0.2;

  // 여유=레드 → 절반 이하=골드 → 임박=딥레드 (색만 의존하지 않도록 가운데 숫자 병행)
  const color = clamped > 0.5 ? 'var(--color-primary)' : clamped > 0.2 ? 'var(--color-gold)' : 'var(--color-primary-active)';

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 0.4, ease: ease.out }}
        />
      </svg>
      <div
        className="tabular"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: size * 0.3,
          color: urgent ? 'var(--color-primary)' : textColor,
        }}
      >
        {label}
      </div>
    </div>
  );
}
