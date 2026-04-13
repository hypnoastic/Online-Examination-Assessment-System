import {
  canPublishResult,
  type ResultStatus,
  transitionResultStatus,
} from "../domain/result-state";
import type {
  ExaminerResultAccessContext,
  ExaminerResultOverviewFilters,
  ExaminerResultOverviewItem,
  ExaminerResultOverviewRow,
  ExaminerResultOverviewViewModel,
  PublishExaminerResultsInput,
  PublishExaminerResultsOutput,
} from "../domain/examiner-results.types";
import { formatPercentageLabel } from "./result-presentation";

const EMPTY_RESULTS_STATE = {
  title: "No Results Found",
  description: "No examiner results match the selected filters.",
} as const;

const normalizeQuery = (query?: string): string => query?.trim().toLowerCase() ?? "";

const sortOverviewItems = (
  items: ExaminerResultOverviewItem[],
): ExaminerResultOverviewItem[] =>
  [...items].sort((left, right) => {
    const submittedDelta = right.submittedAt.getTime() - left.submittedAt.getTime();

    if (submittedDelta !== 0) {
      return submittedDelta;
    }

    return left.resultId.localeCompare(right.resultId);
  });

const getPublishIndicator = (
  status: ResultStatus,
): ExaminerResultOverviewRow["publishIndicator"] => {
  if (status === "PUBLISHED") {
    return {
      canPublish: false,
      label: "ALREADY_PUBLISHED",
      reason: "Result is already published.",
    };
  }

  if (!canPublishResult(status)) {
    return {
      canPublish: false,
      label: "BLOCKED_PENDING_REVIEW",
      reason: "Review is incomplete. Complete all required reviews before publishing.",
    };
  }

  return {
    canPublish: true,
    label: "READY_TO_PUBLISH",
    reason: null,
  };
};

const toSearchableText = (item: ExaminerResultOverviewItem): string =>
  [item.examTitle, item.examCode, item.studentName]
    .map((value) => value.toLowerCase())
    .join(" ");

const toRow = (item: ExaminerResultOverviewItem): ExaminerResultOverviewRow => ({
  resultId: item.resultId,
  exam: `${item.examTitle} (${item.examCode})`,
  student: item.studentName,
  status: item.resultStatus,
  scoreLabel: `${item.finalScore} (${formatPercentageLabel(item.percentage)})`,
  publishIndicator: getPublishIndicator(item.resultStatus),
  submittedAtIso: item.submittedAt.toISOString(),
  publishedAtIso: item.publishedAt?.toISOString() ?? null,
});

export const assertExaminerResultOverviewAccess = (
  context: ExaminerResultAccessContext,
): void => {
  if (context.actorRole !== "EXAMINER") {
    throw new Error("Examiner result overview is restricted to EXAMINER role.");
  }

  if (context.actorId !== context.examinerId) {
    throw new Error("Examiner can access only owned result overviews.");
  }
};

export const listExaminerResultOverviewItems = (
  items: ExaminerResultOverviewItem[],
  filters: ExaminerResultOverviewFilters = {},
): ExaminerResultOverviewItem[] => {
  const query = normalizeQuery(filters.query);

  return sortOverviewItems(
    items.filter((item) => {
      if (filters.examId && item.examId !== filters.examId) {
        return false;
      }

      if (filters.status && item.resultStatus !== filters.status) {
        return false;
      }

      if (query && !toSearchableText(item).includes(query)) {
        return false;
      }

      return true;
    }),
  );
};

export const buildExaminerResultOverviewViewModel = (
  items: ExaminerResultOverviewItem[],
  filters: ExaminerResultOverviewFilters = {},
): ExaminerResultOverviewViewModel => {
  const filtered = listExaminerResultOverviewItems(items, filters);

  const byStatus: Record<ResultStatus, number> = {
    PENDING_REVIEW: 0,
    READY: 0,
    PUBLISHED: 0,
  };

  for (const item of filtered) {
    byStatus[item.resultStatus] += 1;
  }

  if (filtered.length === 0) {
    return {
      total: 0,
      byStatus,
      rows: [],
      emptyState: EMPTY_RESULTS_STATE,
    };
  }

  return {
    total: filtered.length,
    byStatus,
    rows: filtered.map(toRow),
    emptyState: null,
  };
};

export const publishReadyExaminerResults = (
  input: PublishExaminerResultsInput,
): PublishExaminerResultsOutput => {
  const selected = new Set(input.resultIds.map((id) => id.trim()).filter(Boolean));
  let publishedCount = 0;
  let blockedCount = 0;

  const updatedItems = input.items.map((item) => {
    if (!selected.has(item.resultId)) {
      return item;
    }

    if (!canPublishResult(item.resultStatus)) {
      blockedCount += 1;
      return item;
    }

    publishedCount += 1;

    return {
      ...item,
      resultStatus: transitionResultStatus(item.resultStatus, "PUBLISHED"),
      publishedAt: item.publishedAt ?? new Date(),
    };
  });

  return {
    updatedItems,
    publishedCount,
    blockedCount,
  };
};
