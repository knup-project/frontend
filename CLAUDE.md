# KNU-P Frontend — CLAUDE.md

## 프로젝트 개요

KNU-P는 실시간 퀴즈 플랫폼입니다.
- **호스트**: 퀴즈 생성 → 세션 개설 → 진행 → 결과 확인
- **참가자**: PIN 입력 → 실시간 퀴즈 참여 → 순위 확인

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand |
| HTTP 클라이언트 | Axios |
| 실시간 통신 | STOMP over WebSocket (SockJS fallback) |
| 패키지 매니저 | pnpm |

---

## API 정보

```
REST Base URL : https://api.knup.site/api/v1
WebSocket URL : ws://api.knup.site/ws
```

환경변수 (`.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=https://api.knup.site/api/v1
NEXT_PUBLIC_WS_URL=ws://api.knup.site/ws
```

---

## 폴더 구조

```
src/
  app/                    # Next.js App Router
    layout.tsx
    providers.tsx          # QueryClientProvider 등 전역 Provider
    page.tsx

  shared/                 # 프로젝트 전반에서 공유되는 기반
    api/
      client.ts           # Axios 인스턴스 + 인터셉터
      error.ts            # 에러 처리 유틸
    types/
      api.ts              # 모든 API 타입 정의
    constants/
      env.ts              # 환경변수 상수

  features/               # 도메인별 기능 (API + hooks + store + socket)
    auth/
    quizzes/
    sessions/
    participants/
    leaderboard/
    ai/
```

---

## 코딩 컨벤션

- **TypeScript**: `strict: true` 유지, `any` 사용 금지
- **API 필드명**: 명세서와 정확히 일치시킬 것 (임의 필드명 생성 금지)
- **`"use client"`**: 필요한 파일 최상단에 명시 (Server Component 기본)
- **import alias**: `@/*` → `src/*`

### TanStack Query 규칙
- QueryKey는 `keys.ts`에서 팩토리 패턴으로 관리
- mutation 성공 후 반드시 관련 query `invalidateQueries` 처리
- `sessionId` 등 필수값 없으면 `enabled: false`

### Zustand 규칙
- `persist` 미들웨어로 localStorage 동기화 (auth, participant store)
- `clearXxx()` 액션은 localStorage도 함께 정리

### WebSocket 규칙
- `useEffect` cleanup에서 반드시 `unsubscribe()` + `disconnect()` 호출
- `sessionId` 변경 시 기존 연결 정리 후 재연결
- heartbeat는 30초 간격 `setInterval` + cleanup

---

## 브랜치 전략

```
main                 # 프로덕션 브랜치
feat/<feature>       # 기능 개발
fix/<issue>          # 버그 수정
chore/<task>         # 설정, 의존성 등
refactor/<area>      # 리팩토링
```

---

## 커밋 컨벤션 (Conventional Commits)

```
feat(scope): 기능 추가
fix(scope): 버그 수정
chore(scope): 빌드/설정/의존성
refactor(scope): 리팩토링
docs(scope): 문서
style(scope): 포맷
test(scope): 테스트
```

예시:
```
feat(auth): add Zustand auth store with localStorage persist
feat(sessions): add STOMP WebSocket client and useSessionSocket hook
fix(client): prevent duplicate refresh token requests
```

---

## PR 규칙

- 브랜치는 `main`으로 PR
- PR 제목: 커밋 컨벤션과 동일 형식
- PR 본문: 변경 사항 요약 + 관련 Issue 링크 (`Closes #N`)
- 머지 전 `pnpm tsc --noEmit` 통과 확인

---

## 개발 명령어

```bash
pnpm dev          # 개발 서버 (localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
pnpm tsc          # TypeScript 타입 체크 (--noEmit)
```

---

## PR 전략 요약

| Branch | Issue | 내용 | PR |
|--------|-------|------|----|
| `feat/project-init` | #1 | 프로젝트 초기화 + 공통 기반 구조 (Phase 0–2) | PR #1 |
| `feat/auth` | #2 | 인증 기능 (Phase 3) | PR #2 |
| `feat/quiz` | #3 | 퀴즈 CRUD (Phase 4) | PR #3 |
| `feat/session` | #4 | 세션 + 참가자 기능 (Phase 5–6) | PR #4 |
| `feat/leaderboard-ai` | #5 | 리더보드 + AI (Phase 7–8) | PR #5 |
| `feat/websocket` | #6 | WebSocket STOMP (Phase 9) | PR #6 |
| `feat/app-scaffold` | #7 | App Router + 페이지 스캐폴딩 (Phase 10–11) | PR #7 |
