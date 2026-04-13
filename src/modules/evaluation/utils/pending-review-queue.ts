import type {
  PendingReviewQueueAccessContext,
  PendingReviewQueueFilters,
  PendingReviewQueueItem,
  PendingReviewQueueSection,
  PendingReviewQueueViewModel,
  ReviewQueueGroupingKey,
} from "../domain/review-queue.types";

const EMPTY_REVIEW_QUEUE_STATE = {
  title: "No Pending Reviews",
  description:
    "All subjective responses are reviewed for the current filter scope.",
} as const;

const toSearchableText = (item: PendingReviewQueueItem): string =>
  [item.examTitle, item.examCode, item.studentName]
    .map((value) => value.toLowerCase())
    .join(" ");

const normalizeQuery = (query?: string): string => query?.trim().toLowerCase() ?? "";

const groupLabelForItem = (
  item: PendingReviewQueueItem,
  groupBy: ReviewQueueGroupingKey,
): string => (groupBy === "EXAM" ? `${item.examTitle} (${item.examCode})` : item.studentName);

const sortQueueItems = (items: PendingReviewQueueItem[]): PendingReviewQueueItem[] =>
  [...items].sort((left, right) => {
    const timeDelta = right.submittedAt.getTime() - left.submittedAt.getTime();

    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.attemptAnswerId.localeCompare(right.attemptAnswerId);
  });

export const assertExaminerQueueAccess = (
  context: PendingReviewQueueAccessContext,
): void => {
  if (context.actorRole !== "EXAMINER") {
    throw new Error("Pending review queue access is restricted to EXAMINER role.");
  }

  if (context.actorId !== context.examinerId) {
    throw new Error("Examiner can access only their owned pending review queue.");
  }
};

export const listPendingReviewItems = (
  items: PendingReviewQueueItem[],
  filters: PendingReviewQueueFilters = {},
): PendingReviewQueueItem[] => {
  const query = normalizeQuery(filters.query);

  return sortQueueItems(
    items.filter((item) => {
      if (item.resultStatus !== "PENDING_REVIEW") {
        return false;
      }

      if (item.pendingSubjectiveCount <= 0) {
        return false;
      }

      if (filters.examId && item.examId !== filters.examId) {
        return false;
      }

      if (query && !toSearchableText(item).includes(query)) {
        return false;
      }

      return true;
    }),
  );
};

export const groupPendingReviewItems = (
  items: PendingReviewQueueItem[],
  groupBy: ReviewQueueGroupingKey = "EXAM",
): PendingReviewQueueSection[] => {
  const grouped = new Map<string, PendingReviewQueueSection>();

  for (const item of items) {
    const key = groupBy === "EXAM" ? item.examId : item.studentId;
    const existing = grouped.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    grouped.set(key, {
      key,
      label: groupLabelForItem(item, groupBy),
      items: [item],
    });
  }

  return Array.from(grouped.values()).map((section) => ({
    ...section,
    items: sortQueueItems(section.items),
  }));
};

export const buildPendingReviewQueueViewModel = (
  items: PendingReviewQueueItem[],
  filters: PendingReviewQueueFilters = {},
): PendingReviewQueueViewModel => {
  const filteredItems = listPendingReviewItems(items, filters);
  const sections = groupPendingReviewItems(filteredItems, filters.groupBy ?? "EXAM");

  if (filteredItems.length === 0) {
    return {
      totalItems: 0,
      sections: [],
      emptyState: EMPTY_REVIEW_QUEUE_STATE,
    };
  }

  return {
    totalItems: filteredItems.length,
    sections,
    emptyState: null,
  };
};

export const toPendingReviewQueueRows = (
  items: PendingReviewQueueItem[],
): Array<{
  attemptAnswerId: string;
  exam: string;
  student: string;
  reviewStatus: PendingReviewQueueItem["resultStatus"];
  pendingCount: number;
  submittedAtIso: string;
}> =>
  sortQueueItems(items).map((item) => ({
    attemptAnswerId: item.attemptAnswerId,
    exam: `${item.examTitle} (${item.examCode})`,
    student: item.studentName,
    reviewStatus: item.resultStatus,
    pendingCount: item.pendingSubjectiveCount,
    submittedAtIso: item.submittedAt.toISOString(),
  }));
