import { isStudentVisibleResultStatus } from "../domain/result-state";
import type {
  StudentResultAccessContext,
  StudentResultDetailViewModel,
  StudentResultRecord,
  StudentResultSummaryRow,
} from "../domain/student-result.types";
import {
  formatPercentageLabel,
  formatScoreLabel,
  RESULT_STATUS_LABELS,
} from "./result-presentation";

const FEEDBACK_EMPTY_STATE = {
  title: "No Feedback Available",
  description: "No subjective feedback is attached to this published result.",
} as const;

const sortFeedbackItems = (
  items: StudentResultRecord["feedbackItems"],
): StudentResultRecord["feedbackItems"] =>
  [...items].sort((left, right) => left.questionOrder - right.questionOrder);

const toSummaryRow = (record: StudentResultRecord): StudentResultSummaryRow => ({
  resultId: record.resultId,
  exam: `${record.examTitle} (${record.examCode})`,
  score: formatScoreLabel(
    record.scoreBreakdown.final.earned,
    record.scoreBreakdown.final.possible,
  ),
  publishedAtIso: record.publishedAt?.toISOString() ?? "",
});

export const assertStudentResultAccess = (
  context: StudentResultAccessContext,
  record: Pick<StudentResultRecord, "studentId" | "status">,
): void => {
  if (context.actorRole !== "STUDENT") {
    throw new Error("Student result detail is restricted to STUDENT role.");
  }

  if (context.actorId !== record.studentId) {
    throw new Error("Student can access only their own result detail.");
  }

  if (!isStudentVisibleResultStatus(record.status)) {
    throw new Error("Result is not visible to students until it is PUBLISHED.");
  }
};

export const listPublishedStudentResultSummaries = (
  records: StudentResultRecord[],
): StudentResultSummaryRow[] =>
  records
    .filter((record) => isStudentVisibleResultStatus(record.status))
    .sort((left, right) => {
      const leftTime = left.publishedAt?.getTime() ?? 0;
      const rightTime = right.publishedAt?.getTime() ?? 0;
      const delta = rightTime - leftTime;

      if (delta !== 0) {
        return delta;
      }

      return left.resultId.localeCompare(right.resultId);
    })
    .map(toSummaryRow);

export const buildStudentResultDetailViewModel = (
  record: StudentResultRecord,
): StudentResultDetailViewModel => {
  if (!isStudentVisibleResultStatus(record.status) || !record.publishedAt) {
    throw new Error("Result detail can only be built for published results.");
  }

  const feedbackItems = sortFeedbackItems(record.feedbackItems).map((item) => ({
    questionOrder: item.questionOrder,
    questionStem: item.questionStem,
    score: formatScoreLabel(item.marksAwarded, item.maxMarks),
    feedback: item.feedback,
  }));

  return {
    header: {
      exam: `${record.examTitle} (${record.examCode})`,
      student: record.studentName,
      statusLabel: RESULT_STATUS_LABELS[record.status],
      gradeLabel: record.gradeLabel ?? null,
      publishedAtIso: record.publishedAt.toISOString(),
    },
    scorecards: [
      {
        label: "Objective",
        score: formatScoreLabel(
          record.scoreBreakdown.objective.earned,
          record.scoreBreakdown.objective.possible,
        ),
      },
      {
        label: "Subjective",
        score: formatScoreLabel(
          record.scoreBreakdown.subjective.earned,
          record.scoreBreakdown.subjective.possible,
        ),
      },
      {
        label: "Final",
        score: formatScoreLabel(
          record.scoreBreakdown.final.earned,
          record.scoreBreakdown.final.possible,
        ),
      },
    ],
    percentage: formatPercentageLabel(record.scoreBreakdown.percentage),
    feedbackPanel: {
      totalFeedbackItems: feedbackItems.length,
      items: feedbackItems,
      emptyState: feedbackItems.length === 0 ? FEEDBACK_EMPTY_STATE : null,
    },
  };
};
