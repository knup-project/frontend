# KNU-P 🎯

> 실시간 퀴즈 플랫폼 — 호스트가 퀴즈를 만들고, 참가자가 PIN으로 입장해 실시간으로 참여합니다.

---

## 📌 서비스 소개

| 역할 | 플로우 |
|------|--------|
| **호스트** | 퀴즈 생성 → 세션 개설 → 진행 → 결과 확인 |
| **참가자** | PIN 입력 → 닉네임 등록 → 실시간 퀴즈 참여 → 순위 확인 |

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 (strict) |
| 스타일 | Tailwind CSS 4 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand 5 |
| HTTP 클라이언트 | Axios |
| 실시간 통신 | STOMP over WebSocket (`@stomp/stompjs` + SockJS fallback) |
| 패키지 매니저 | pnpm |
| 런타임 | React 19 |

---

## 📁 폴더 구조

```
src/
├── app/                    # Next.js App Router (pages, layouts)
│   ├── layout.tsx
│   ├── providers.tsx       # QueryClientProvider 등 전역 Provider
│   └── page.tsx
│
├── shared/                 # 프로젝트 전반에서 공유되는 기반
│   ├── api/
│   │   ├── client.ts       # Axios 인스턴스 + 인터셉터
│   │   └── error.ts        # 에러 처리 유틸
│   ├── types/
│   │   └── api.ts          # 모든 API 타입 정의
│   └── constants/
│       └── env.ts          # 환경변수 상수
│
└── features/               # 도메인별 기능
    ├── auth/               # 로그인 / 회원가입
    ├── quizzes/            # 퀴즈 CRUD
    ├── sessions/           # 세션 개설 및 진행
    ├── participants/       # 참가자 입장 및 플로우
    ├── leaderboard/        # 실시간 순위
    └── ai/                 # AI 퀴즈 생성
```
---

## 🚀 개발 시작

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행 (localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 타입 체크
pnpm tsc --noEmit

# Lint
pnpm lint
```

---

## 🌿 브랜치 전략

```
main                 # 프로덕션 브랜치
feat/<feature>       # 기능 개발
fix/<issue>          # 버그 수정
chore/<task>         # 설정, 의존성 등
refactor/<area>      # 리팩토링
```

---

## 📝 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

```
feat(scope): 기능 추가
fix(scope): 버그 수정
chore(scope): 빌드/설정/의존성
refactor(scope): 리팩토링
docs(scope): 문서
style(scope): 포맷
test(scope): 테스트
```
