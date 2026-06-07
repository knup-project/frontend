/**
 * 크누피 디자인 토큰 (TypeScript 상수) — "Warm Arcade"
 *
 * CSS 변수(globals.css)와 병행 사용합니다.
 * className 기반 스타일은 globals.css 의 CSS 변수를 사용하고,
 * 동적 인라인 스타일이나 framer-motion prop 이 필요할 때 이 상수를 사용합니다.
 *
 * 기준 문서: docs/DESIGN.md
 * 색 기준: KNU RED = PANTONE DS87-1C(#E60000), KNU GRAY = PANTONE DS325-1C(#797977)
 */

// ─────────────────────────────────────────────
// 색상 토큰
// ─────────────────────────────────────────────

export const colors = {
  // 브랜드 (KNU RED — CTA·헤더·정답 셀러브레이션 전용)
  primary: '#e60000',
  primaryActive: '#c00000',
  primaryDisabled: '#f4b3b3',
  primaryTint: '#fff2f2',
  onPrimary: '#ffffff',

  // 중립 (KNU GRAY — 구조/본문)
  knuGray: '#797977',
  ink: '#2a2a2a',
  body: '#4a4a4a',
  muted: '#6a6a6a',
  mutedSoft: '#929292',

  // Surface
  canvas: '#ffffff',
  surfaceSoft: '#f7f7f5',
  surfaceStrong: '#f0efed',

  // Border
  hairline: '#e3e3e3',
  hairlineSoft: '#ededeb',
  borderStrong: '#c1c1bf',

  // Scrim
  scrim: 'rgba(0, 0, 0, 0.5)',
} as const;

/** 다크 무대 (라이브: 문제·세션 화면) */
export const stage = {
  bg: '#131217',
  ink: '#17161a', // DESIGN 명시 — 기본 무대 톤
  surface: '#201e25',
  raised: '#2a2730',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#f4f2f7',
  muted: '#a8a4b0',
} as const;

/** 게임 시맨틱 색 */
export const game = {
  correct: '#1fa971', // 정답 — 그린
  correctTint: '#e6f7ef',
  wrong: '#6a6a6a', // 오답 — 중립 dim (두 번째 레드 금지)
  wrongTint: '#f0efed',
  gold: '#c9a227', // 승리·시상 액센트 (전통 교색 헤리티지)
  goldTint: '#fbf4dd',
} as const;

/**
 * 4지선다 토큰 — 레드 제외(브랜드 전용).
 * 접근성: 색만으로 구분 금지 → 도형(shape)·글리프·라벨을 병행합니다.
 */
export const choices = [
  { key: 'blue', color: '#2d7ff9', shape: 'triangle', glyph: '▲', label: 'A' },
  { key: 'yellow', color: '#f4b400', shape: 'circle', glyph: '●', label: 'B' },
  { key: 'green', color: '#1fa971', shape: 'square', glyph: '■', label: 'C' },
  { key: 'purple', color: '#7c4dff', shape: 'diamond', glyph: '◆', label: 'D' },
] as const;

export type ChoiceToken = (typeof choices)[number];

// ─────────────────────────────────────────────
// 간격 토큰 (px)
// ─────────────────────────────────────────────

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
} as const;

// ─────────────────────────────────────────────
// 반경 토큰
// ─────────────────────────────────────────────

export const radius = {
  sm: '10px', // 버튼
  md: '16px', // 카드
  lg: '24px', // 큰 패널·무대
  full: '9999px',
} as const;

// ─────────────────────────────────────────────
// 그림자 (단일 → 다단계 elevation + 게임 글로우)
// ─────────────────────────────────────────────

export const shadows = {
  elev1: 'rgba(0,0,0,0.04) 0 1px 2px 0, rgba(0,0,0,0.04) 0 0 0 1px',
  elev2: 'rgba(0,0,0,0.05) 0 2px 6px 0, rgba(0,0,0,0.04) 0 0 0 1px',
  elev3: 'rgba(0,0,0,0.08) 0 6px 16px -2px, rgba(0,0,0,0.04) 0 0 0 1px',
  elev4: 'rgba(0,0,0,0.14) 0 18px 40px -8px, rgba(0,0,0,0.05) 0 0 0 1px',
  glowRed: '0 0 0 1px rgba(230,0,0,0.35), 0 8px 28px -6px rgba(230,0,0,0.5)',
  glowRedNeon: '0 0 24px rgba(230,0,0,0.45), 0 0 64px rgba(230,0,0,0.25)',
  glowCorrect: '0 0 0 1px rgba(31,169,113,0.35), 0 8px 28px -6px rgba(31,169,113,0.45)',
  glowGold: '0 0 24px rgba(201,162,39,0.5), 0 0 64px rgba(201,162,39,0.25)',
  /** @deprecated elev3 사용 권장 */
  float: 'rgba(0,0,0,0.08) 0 6px 16px -2px, rgba(0,0,0,0.04) 0 0 0 1px',
} as const;

// ─────────────────────────────────────────────
// 타이포그래피 토큰
// ─────────────────────────────────────────────

export const typography = {
  // 디스플레이 숫자 — 점수·타이머·PIN 주인공화 (tabular-nums 권장)
  pinDisplay: { size: '56px', weight: 800, lineHeight: 1.0, letterSpacing: '0.08em' },
  scoreDisplay: { size: '48px', weight: 800, lineHeight: 1.0, letterSpacing: '-0.01em' },
  timerDisplay: { size: '40px', weight: 700, lineHeight: 1.0, letterSpacing: '0' },

  ratingDisplay: { size: '64px', weight: 700, lineHeight: 1.1, letterSpacing: '-1px' },
  displayXl:     { size: '28px', weight: 700, lineHeight: 1.43, letterSpacing: '0' },
  displayLg:     { size: '22px', weight: 500, lineHeight: 1.18, letterSpacing: '-0.44px' },
  displayMd:     { size: '21px', weight: 700, lineHeight: 1.43, letterSpacing: '0' },
  displaySm:     { size: '20px', weight: 600, lineHeight: 1.2, letterSpacing: '-0.18px' },
  titleMd:       { size: '16px', weight: 600, lineHeight: 1.25, letterSpacing: '0' },
  titleSm:       { size: '16px', weight: 500, lineHeight: 1.25, letterSpacing: '0' },
  bodyMd:        { size: '16px', weight: 400, lineHeight: 1.5, letterSpacing: '0' },
  bodySm:        { size: '14px', weight: 400, lineHeight: 1.43, letterSpacing: '0' },
  caption:       { size: '14px', weight: 500, lineHeight: 1.29, letterSpacing: '0' },
  captionSm:     { size: '13px', weight: 400, lineHeight: 1.23, letterSpacing: '0' },
  badge:         { size: '11px', weight: 600, lineHeight: 1.18, letterSpacing: '0' },
  microLabel:    { size: '12px', weight: 700, lineHeight: 1.33, letterSpacing: '0' },
  uppercaseTag:  { size: '8px',  weight: 700, lineHeight: 1.25, letterSpacing: '0.32px', textTransform: 'uppercase' as const },
  buttonMd:      { size: '16px', weight: 600, lineHeight: 1.25, letterSpacing: '0' },
  buttonSm:      { size: '14px', weight: 600, lineHeight: 1.29, letterSpacing: '0' },
  link:          { size: '14px', weight: 400, lineHeight: 1.43, letterSpacing: '0' },
  navLink:       { size: '16px', weight: 600, lineHeight: 1.25, letterSpacing: '0' },
} as const;

// ─────────────────────────────────────────────
// 모션 토큰 (초 단위 — framer-motion duration)
// ─────────────────────────────────────────────

export const motion = {
  durFast: 0.12,
  durBase: 0.22,
  durSlow: 0.42,
} as const;

// ─────────────────────────────────────────────
// 브레이크포인트
// ─────────────────────────────────────────────

export const breakpoints = {
  mobile: 744,   // < 744px
  tablet: 1128,  // 744–1128px
  desktop: 1440, // 1128–1440px
} as const;
