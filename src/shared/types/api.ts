// ─────────────────────────────────────────────
// Enum / Union Types
// ─────────────────────────────────────────────

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type SessionMode = 'INDIVIDUAL' | 'TEAM';
export type SessionStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
export type AIQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MIXED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Language = 'KO' | 'EN';

// ─────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────

export interface QuestionCreateRequest {
  content: string;
  type: QuestionType;
  options?: string[];       // MULTIPLE_CHOICE 일 때 보기 목록
  answer: string;
  explanation?: string;
  timeLimit?: number;       // 초 단위
  points?: number;
}

export interface QuizCreateRequest {
  title: string;
  description?: string;
  questions: QuestionCreateRequest[];
}

export interface QuestionResponse {
  id: number;
  content: string;
  type: QuestionType;
  options?: string[];
  answer: string;
  explanation?: string;
  timeLimit: number;
  points: number;
  orderIndex: number;
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetailResponse extends QuizResponse {
  questions: QuestionResponse[];
}

// ─────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────

export interface SessionCreateRequest {
  quizId: number;
  mode: SessionMode;
  teamCount?: number;       // TEAM 모드일 때
  maxParticipants?: number;
}

export interface SessionParticipant {
  participantId: string;
  nickname: string;
  teamId?: string;
}

/** 진행 중(송출된) 문제 스냅샷 — WS 이벤트를 놓쳤을 때 REST 복구용 (정답 미포함) */
export interface CurrentQuestion {
  id: number;
  content: string;
  type: QuestionType;
  options?: string[];
  timeLimit: number;
  points: number;
}

export interface SessionResponse {
  sessionId: string;
  pin: string;
  quizId: number;
  quizTitle: string;
  mode: SessionMode;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  maxParticipants?: number;
  participantCount: number;
  participants: SessionParticipant[];
  /** IN_PROGRESS 이고 문제가 송출된 상태일 때만 존재 */
  currentQuestion?: CurrentQuestion | null;
  /** 현재 문제의 서버 계산 남은 시간(초) */
  questionRemainingSec?: number | null;
  createdAt: string;
}

export interface JoinSessionRequest {
  pin: string;
  nickname: string;
  teamId?: string;
}

export interface JoinSessionResponse {
  participantId: string;
  sessionId: string;
  nickname: string;
  teamId?: string;
}

export interface AnswerSubmitRequest {
  questionId: number;
  answer: string;
  responseTimeSec?: number;
}

export interface AnswerResultResponse {
  correct: boolean;
  correctAnswer: string;
  points: number;
  totalPoints: number;
  rank: number;
}

// ─────────────────────────────────────────────
// Leaderboard
// ─────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  nickname: string;
  totalPoints: number;
  correctCount: number;
  averageResponseTimeSec: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  totalPoints: number;
  memberCount: number;
}

// ─────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────

export interface AIQuizGenerateRequest {
  text: string;
  questionCount?: number;
  questionType?: AIQuestionType;
  difficulty?: Difficulty;
  language?: Language;
}

export interface AIQuizGenerateResponse {
  questions: QuestionCreateRequest[];
  generatedAt: string;
}

export interface AIExplainRequest {
  questionId: number;
  participantAnswer?: string;
}

export interface AIExplainResponse {
  explanation: string;
  hint?: string;
  generatedAt: string;
}

// ─────────────────────────────────────────────
// WebSocket Event Types
// ─────────────────────────────────────────────

export interface SessionQuestionEvent {
  sessionId: string;
  questionIndex: number;
  totalQuestions: number;
  question: {
    id: number;
    content: string;
    type: QuestionType;
    options?: string[];
    timeLimit: number;
    points: number;
  };
  startedAt: string;
}

export interface SessionResultEvent {
  sessionId: string;
  questionId: number;
  correctAnswer: string;
  answerDistribution: Record<string, number>;
  answeredCount: number;
  accuracy: number;
}

export interface SessionLeaderboardEvent {
  sessionId: string;
  currentQuestion: number;
  entries: LeaderboardEntry[];
}

export interface SessionStatusEvent {
  sessionId: string;
  status: SessionStatus;
  message?: string;
}

export interface SessionParticipantsEvent {
  sessionId: string;
  participants: Array<{
    participantId: string;
    nickname: string;
    teamId?: string;
  }>;
  totalCount: number;
}
