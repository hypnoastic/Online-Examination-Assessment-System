export const EXAM_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
] as const;

export type ExamStatus = (typeof EXAM_STATUSES)[number];

export interface DraftExamValues {
  title: string;
  code: string;
  instructions: string[];
  durationMinutes: number;
  windowStartsAt: Date;
  windowEndsAt: Date;
  status: "DRAFT";
}

export interface DraftExamSummary extends DraftExamValues {
  examId: string;
}
