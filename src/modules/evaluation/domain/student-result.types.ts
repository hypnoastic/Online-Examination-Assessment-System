import type { ResultStatus } from "./result-state";
import type { ResultScoreBreakdown } from "./scoring.types";

export interface StudentResultFeedbackItem {
  attemptAnswerId: string;
  questionOrder: number;
  questionStem: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

export interface StudentResultRecord {
  resultId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentName: string;
  status: ResultStatus;
  scoreBreakdown: ResultScoreBreakdown;
  gradeLabel?: string | null;
  publishedAt: Date | null;
  feedbackItems: StudentResultFeedbackItem[];
}

export interface StudentResultAccessContext {
  actorId: string;
  actorRole: "EXAMINER" | "STUDENT" | "ADMIN";
}

export interface StudentResultSummaryRow {
  resultId: string;
  exam: string;
  score: string;
  publishedAtIso: string;
}

export interface StudentResultDetailViewModel {
  header: {
    exam: string;
    student: string;
    statusLabel: string;
    gradeLabel: string | null;
    publishedAtIso: string;
  };
  scorecards: Array<{
    label: "Objective" | "Subjective" | "Final";
    score: string;
  }>;
  percentage: string;
  feedbackPanel: {
    totalFeedbackItems: number;
    items: Array<{
      questionOrder: number;
      questionStem: string;
      score: string;
      feedback: string;
    }>;
    emptyState: {
      title: string;
      description: string;
    } | null;
  };
}
