/**
 * Airbnb 디자인 토큰 (TypeScript 상수)
 *
 * CSS 변수와 병행 사용합니다.
 * className 기반 스타일은 globals.css 의 CSS 변수를 사용하고,
 * 동적 인라인 스타일이 필요할 때 이 상수를 사용합니다.
 *
 * 출처: .claude/design.md
 */

// ─────────────────────────────────────────────
// 색상 토큰
// ─────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#ff385c',          // Rausch — 메인 CTA, 검색 오브, 하트 저장 상태
  primaryActive: '#e00b41',    // Rausch Active — press 상태
  primaryDisabled: '#ffd1da',  // Rausch Disabled — 비활성 CTA

  // Surface
  canvas: '#ffffff',           // 기본 페이지 배경
  surfaceSoft: '#f7f7f7',      // 비활성 필드, 서브 nav 호버
  surfaceStrong: '#f2f2f2',    // 아이콘 버튼 서피스

  // Border
  hairline: '#dddddd',         // 기본 1px 테두리
  hairlineSoft: '#ebebeb',     // 스크롤 섹션 구분선
  borderStrong: '#c1c1c1',     // 비활성 아웃라인 버튼, 포커스 후 인풋

  // Text
  ink: '#222222',              // 헤드라인, 본문, 주요 링크
  body: '#3f3f3f',             // 리뷰·편의시설 본문 (ink 보다 가벼움)
  muted: '#6a6a6a',            // 서브타이틀, 비활성 탭 레이블
  mutedSoft: '#929292',        // 비활성 링크 텍스트
  onPrimary: '#ffffff',        // Rausch CTA 위 흰 텍스트

  // Semantic
  error: '#c13515',            // 폼 유효성 오류 텍스트
  errorHover: '#b32505',       // 오류 링크 호버
  legalLink: '#428bff',        // 법적 고지 링크

  // Scrim
  scrim: 'rgba(0, 0, 0, 0.5)', // 모달 백드롭
} as const;

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
  sm: '8px',      // 버튼
  md: '14px',     // 카드
  xl: '32px',     // 카테고리 스트립
  full: '9999px', // 검색바, 알약 버튼, 하트, 검색 오브
} as const;

// ─────────────────────────────────────────────
// 그림자 (단일 elevation tier)
// ─────────────────────────────────────────────

export const shadows = {
  /** 카드 호버, 검색바, 드롭다운 메뉴 */
  float: 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0',
} as const;

// ─────────────────────────────────────────────
// 타이포그래피 토큰
// ─────────────────────────────────────────────

export const typography = {
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
  buttonMd:      { size: '16px', weight: 500, lineHeight: 1.25, letterSpacing: '0' },
  buttonSm:      { size: '14px', weight: 500, lineHeight: 1.29, letterSpacing: '0' },
  link:          { size: '14px', weight: 400, lineHeight: 1.43, letterSpacing: '0' },
  navLink:       { size: '16px', weight: 600, lineHeight: 1.25, letterSpacing: '0' },
} as const;

// ─────────────────────────────────────────────
// 브레이크포인트
// ─────────────────────────────────────────────

export const breakpoints = {
  mobile: 744,   // < 744px
  tablet: 1128,  // 744–1128px
  desktop: 1440, // 1128–1440px
} as const;
