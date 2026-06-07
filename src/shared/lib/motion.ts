/**
 * 크누피 공용 모션 프리셋 (motion v12 / framer-motion)
 *
 * 컴포넌트에서 transition·variants 를 재사용합니다.
 * 기준 문서: docs/DESIGN.md §7 (게임 모션 3종)
 */
import { cubicBezier } from 'motion/react';
import type { Transition, Variants } from 'motion/react';
import { motion as motionTokens } from '@/shared/constants/design';

/** 이징 — globals.css 의 --ease-* 와 동일 곡선 */
export const ease = {
  out: cubicBezier(0.22, 1, 0.36, 1),
  bounce: cubicBezier(0.34, 1.56, 0.64, 1),
  inOut: cubicBezier(0.65, 0, 0.35, 1),
} as const;

export const transitions = {
  fast: { duration: motionTokens.durFast, ease: ease.out },
  base: { duration: motionTokens.durBase, ease: ease.out },
  pop: { duration: motionTokens.durBase, ease: ease.bounce },
  slow: { duration: motionTokens.durSlow, ease: ease.out },
} satisfies Record<string, Transition>;

/** 아래에서 떠오르며 페이드 인 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: transitions.base },
};

/** 살짝 튀며 등장 (정답·강조) */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: transitions.pop },
};

/** 자식 순차 등장 (리스트·리더보드) */
export const staggerChildren: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
