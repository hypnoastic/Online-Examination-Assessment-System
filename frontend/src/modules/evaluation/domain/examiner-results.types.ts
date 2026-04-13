import type { ResultStatus } from "./result-state";

export interface ExaminerResultOverviewItem {
  resultId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  examinerId: string;
  studentId: string;
  studentName: string;
  resultStatus: ResultStatus;
  pendingSubjectiveCount: number;
  finalScore: number;
  percentage: number;
  submittedAt: Date;
  publishedAt?: Date | null;
}

export interface ExaminerResultOverviewFilters {
  examId?: string;
  query?: string;
  status?: ResultStatus;
}

export interface ExaminerResultOverviewRow {
  resultId: string;
  exam: string;
  student: string;
  status: ResultStatus;
  scoreLabel: string;
  publishIndicator: {
    canPublish: boolean;
    label: "READY_TO_PUBLISH" | "BLOCKED_PENDING_REVIEW" | "ALREADY_PUBLISHED";
    reason: string | null;
  };
  submittedAtIso: string;
  publishedAtIso: string | null;
}

export interface ExaminerResultOverviewViewModel {
  total: number;
  byStatus: Record<ResultStatus, number>;
  rows: ExaminerResultOverviewRow[];
  emptyState: {
    title: string;
    description: string;
  } | null;
}

export interface ExaminerResultAccessContext {
  actorId: string;
  actorRole: "EXAMINER" | "STUDENT" | "ADMIN";
  examinerId: string;
}

export interface PublishExaminerResultsInput {
  items: ExaminerResultOverviewItem[];
  resultIds: string[];
}

export interface PublishExaminerResultsOutput {
  updatedItems: ExaminerResultOverviewItem[];
  publishedCount: number;
  blockedCount: number;
}
