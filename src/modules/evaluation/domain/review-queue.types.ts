import type { AttemptReviewStatus, ResultStatus } from "./result-state";

export const REVIEW_QUEUE_GROUPING_KEYS = ["EXAM", "STUDENT"] as const;

export type ReviewQueueGroupingKey = (typeof REVIEW_QUEUE_GROUPING_KEYS)[number];

export interface PendingReviewQueueItem {
  attemptId: string;
  attemptAnswerId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  examinerId: string;
  studentId: string;
  studentName: string;
  questionType: "SHORT_TEXT" | "LONG_TEXT";
  resultStatus: ResultStatus;
  attemptStatus: AttemptReviewStatus;
  pendingSubjectiveCount: number;
  submittedAt: Date;
}

export interface PendingReviewQueueFilters {
  examId?: string;
  query?: string;
  groupBy?: ReviewQueueGroupingKey;
}

export interface PendingReviewQueueSection {
  key: string;
  label: string;
  items: PendingReviewQueueItem[];
}

export interface PendingReviewQueueViewModel {
  totalItems: number;
  sections: PendingReviewQueueSection[];
  emptyState: {
    title: string;
    description: string;
  } | null;
}

export interface PendingReviewQueueAccessContext {
  actorId: string;
  actorRole: "EXAMINER" | "STUDENT" | "ADMIN";
  examinerId: string;
}
