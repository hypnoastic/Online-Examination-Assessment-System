import type { QuestionReviewMode, QuestionType } from "../../questions";

import type { AssignedExamRecord } from "./assigned-exam.types";

export const ATTEMPT_START_BLOCK_REASONS = [
  "NOT_ASSIGNED",
  "WINDOW_NOT_OPEN",
  "WINDOW_CLOSED",
  "MANUALLY_BLOCKED",
  "ALREADY_SUBMITTED",
  "ATTEMPT_NOT_ACTIVE",
  "ATTEMPT_NOT_FOUND",
] as const;

export type AttemptStartBlockReason =
  (typeof ATTEMPT_START_BLOCK_REASONS)[number];

export type AttemptStartOutcome =
  | "READY_TO_START"
  | "RESUME_ACTIVE"
  | "BLOCKED";

export type AttemptFlowTone = "ready" | "resume" | "blocked";

export interface AttemptSessionQuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface AttemptSessionQuestionRecord {
  examQuestionId: string;
  questionId: string;
  questionOrder: number;
  type: QuestionType;
  reviewMode: QuestionReviewMode;
  stem: string;
  maxMarks: number;
  options?: AttemptSessionQuestionOption[];
}

export interface AttemptSessionTemplate {
  instructions: string[];
  questions: AttemptSessionQuestionRecord[];
}

export interface AttemptBootstrapRecord extends AssignedExamRecord {
  sessionTemplate: AttemptSessionTemplate;
}

export interface AttemptSessionPayload {
  attemptId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  durationMinutes: number;
  status: "IN_PROGRESS";
  startedAt: Date;
  expiresAt: Date;
  questionCount: number;
  instructions: string[];
  questions: AttemptSessionQuestionRecord[];
}

export interface AttemptStartEntryViewModel {
  outcome: AttemptStartOutcome;
  tone: AttemptFlowTone;
  title: string;
  message: string;
  actionLabel: string | null;
  actionHref: string | null;
  blockReason: AttemptStartBlockReason | null;
  session: AttemptSessionPayload | null;
}

export interface AttemptSessionLoadResult {
  status: "READY" | "BLOCKED";
  title: string;
  message: string;
  blockReason: AttemptStartBlockReason | null;
  session: AttemptSessionPayload | null;
}
