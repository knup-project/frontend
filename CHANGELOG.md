# Changelog

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/), 버전은 [SemVer](https://semver.org/lang/ko/)를 따릅니다.

## [Unreleased]
### 계획
- 호스트 문제 건너뛰기/일시정지, 결과 내보내기 — [로드맵](https://github.com/knup-project/.github/blob/main/docs/ROADMAP.md)

## [1.0.0] - 2026-06-12
### Added
- 호스트 대기실 실시간 참가자 목록 + 강퇴(단건/일괄/전체), 세션 종료
- 참가자 라운지/내 팀 강조, 응답 계약 정합
### Fixed
- PDF 업로드 Content-Type 버그, 1문제 퀴즈 진행 불가, WebSocket 유실 폴백
- SockJS `https://` 전달로 실시간 연결 복구, zustand v5 selector 무한 루프
- 미로그인 참가 플로우 401 리다이렉트 차단 + 에러 바운더리, GuestGuard

## [0.2.0] - 2026-06-05
### Added
- 디자인 시스템 "Warm Arcade"(KNU Red·Jua·Neubrutalism, 마스코트 크누피, 게임 모션)
- 랜딩·대시보드 아케이드 리프레시, 퀴즈 폼 아코디언 UX

## [0.1.0] - 2026-05-29
### Added
- 프로젝트 기반(Next.js 16 App Router, FSD 구조), 인증·퀴즈 관리, API 클라이언트

[Unreleased]: https://github.com/knup-project/frontend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/knup-project/frontend/releases/tag/v1.0.0
[0.2.0]: https://github.com/knup-project/frontend/releases/tag/v0.2.0
[0.1.0]: https://github.com/knup-project/frontend/releases/tag/v0.1.0
