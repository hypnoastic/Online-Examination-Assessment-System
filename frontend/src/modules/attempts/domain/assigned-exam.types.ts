export const ASSIGNED_EXAM_WINDOW_STATUSES = [
  "UPCOMING",
  "OPEN",
  "CLOSED",
] as const;

export type AssignedExamWindowStatus =
  (typeof ASSIGNED_EXAM_WINDOW_STATUSES)[number];

export const STUDENT_ATTEMPT_STATUSES = [
  "IN_PROGRESS",
  "SUBMITTED",
  "AUTO_SUBMITTED",
  "UNDER_REVIEW",
  "EVALUATED",
] as const;

export type StudentAttemptStatus = (typeof STUDENT_ATTEMPT_STATUSES)[number];

export interface AssignedExamAttemptRecord {
  attemptId: string;
  status: StudentAttemptStatus;
  startedAt: Date;
  expiresAt: Date | null;
  submittedAt: Date | null;
}

export interface AssignedExamRecord {
  assignmentId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  durationMinutes: number;
  windowStartsAt: Date;
  windowEndsAt: Date;
  windowStatus: AssignedExamWindowStatus;
  isManuallyBlocked: boolean;
  attempt: AssignedExamAttemptRecord | null;
}

export type AssignedExamListStatusLabel =
  | "Start"
  | "Continue"
  | "Locked"
  | "Submitted";

export type AssignedExamStatusTone =
  | "ready"
  | "active"
  | "locked"
  | "completed";

export interface AssignedExamActionViewModel {
  label: AssignedExamListStatusLabel;
  href: string | null;
  disabled: boolean;
}

export interface AssignedExamListItemViewModel {
  assignmentId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  durationMinutes: number;
  windowStartsAt: Date;
  windowEndsAt: Date;
  statusLabel: AssignedExamListStatusLabel;
  statusTone: AssignedExamStatusTone;
  helperText: string;
  action: AssignedExamActionViewModel;
}

export interface AssignedExamListSummary {
  total: number;
  startCount: number;
  continueCount: number;
  lockedCount: number;
  submittedCount: number;
  actionableCount: number;
}
