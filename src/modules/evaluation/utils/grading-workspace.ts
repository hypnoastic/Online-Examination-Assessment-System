import type {
  GradingMarksEntryInput,
  GradingWorkspaceItem,
  GradingWorkspaceNavigation,
  GradingWorkspaceViewModel,
  ManualReviewEntry,
} from "../domain/grading-workspace.types";

const sortWorkspaceItems = (
  items: GradingWorkspaceItem[],
): GradingWorkspaceItem[] =>
  [...items].sort((left, right) => {
    const timeDelta = right.submittedAt.getTime() - left.submittedAt.getTime();

    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.attemptAnswerId.localeCompare(right.attemptAnswerId);
  });

const normalizeFeedback = (feedback?: string): string | null => {
  if (feedback === undefined) {
    return null;
  }

  const trimmed = feedback.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const toParagraphs = (answerText: string): string[] =>
  answerText
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

const toLineCount = (answerText: string): number =>
  answerText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

const buildNavigation = (
  sortedItems: GradingWorkspaceItem[],
  currentAttemptAnswerId: string,
): GradingWorkspaceNavigation => {
  const index = sortedItems.findIndex(
    (item) => item.attemptAnswerId === currentAttemptAnswerId,
  );

  if (index < 0) {
    throw new Error(
      `Attempt answer ${currentAttemptAnswerId} is not in the pending grading workspace.`,
    );
  }

  return {
    currentAttemptAnswerId,
    previousAttemptAnswerId: sortedItems[index - 1]?.attemptAnswerId ?? null,
    nextAttemptAnswerId: sortedItems[index + 1]?.attemptAnswerId ?? null,
    position: index + 1,
    total: sortedItems.length,
  };
};

export const validateMarksAwarded = (
  marksAwarded: number,
  maxMarks: number,
): void => {
  if (!Number.isFinite(marksAwarded)) {
    throw new Error("marksAwarded must be a finite number.");
  }

  if (!Number.isFinite(maxMarks) || maxMarks < 0) {
    throw new Error("maxMarks must be a non-negative number.");
  }

  if (marksAwarded < 0 || marksAwarded > maxMarks) {
    throw new Error(`marksAwarded must be between 0 and ${maxMarks}.`);
  }
};

export const createManualReviewEntry = (
  item: GradingWorkspaceItem,
  reviewerId: string,
  input: GradingMarksEntryInput,
  reviewedAt: Date = new Date(),
): ManualReviewEntry => {
  validateMarksAwarded(input.marksAwarded, item.maxMarks);

  return {
    attemptAnswerId: item.attemptAnswerId,
    reviewerId,
    marksAwarded: input.marksAwarded,
    feedback: normalizeFeedback(input.feedback),
    reviewedAt,
  };
};

export const buildGradingWorkspaceViewModel = (
  items: GradingWorkspaceItem[],
  currentAttemptAnswerId: string,
  existingReview?: Pick<ManualReviewEntry, "marksAwarded" | "feedback">,
): GradingWorkspaceViewModel => {
  if (items.length === 0) {
    throw new Error("Cannot build grading workspace with no pending answers.");
  }

  const sortedItems = sortWorkspaceItems(items);
  const currentItem = sortedItems.find(
    (item) => item.attemptAnswerId === currentAttemptAnswerId,
  );

  if (!currentItem) {
    throw new Error(
      `Attempt answer ${currentAttemptAnswerId} is not in the pending grading workspace.`,
    );
  }

  return {
    header: {
      exam: `${currentItem.examTitle} (${currentItem.examCode})`,
      student: currentItem.studentName,
      questionType: currentItem.questionType,
    },
    questionPanel: {
      stem: currentItem.questionStem,
      modelAnswer: currentItem.modelAnswerText?.trim() || null,
    },
    answerPanel: {
      text: currentItem.studentAnswerText,
      paragraphs: toParagraphs(currentItem.studentAnswerText),
      lineCount: toLineCount(currentItem.studentAnswerText),
    },
    marksPanel: {
      maxMarks: currentItem.maxMarks,
      marksAwarded: existingReview?.marksAwarded ?? null,
      feedback: existingReview?.feedback ?? "",
    },
    navigation: buildNavigation(sortedItems, currentAttemptAnswerId),
  };
};

export const getNextPendingAttemptAnswerId = (
  items: GradingWorkspaceItem[],
  currentAttemptAnswerId: string,
): string | null =>
  buildNavigation(sortWorkspaceItems(items), currentAttemptAnswerId)
    .nextAttemptAnswerId;

export const getPreviousPendingAttemptAnswerId = (
  items: GradingWorkspaceItem[],
  currentAttemptAnswerId: string,
): string | null =>
  buildNavigation(sortWorkspaceItems(items), currentAttemptAnswerId)
    .previousAttemptAnswerId;
