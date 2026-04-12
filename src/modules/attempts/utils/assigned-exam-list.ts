import type {
  AssignedExamActionViewModel,
  AssignedExamListItemViewModel,
  AssignedExamListStatusLabel,
  AssignedExamListSummary,
  AssignedExamRecord,
  StudentAttemptStatus,
} from "../domain/assigned-exam.types";

const CLOSED_ATTEMPT_STATUSES: readonly StudentAttemptStatus[] = [
  "SUBMITTED",
  "AUTO_SUBMITTED",
  "UNDER_REVIEW",
  "EVALUATED",
];

const STATUS_PRIORITY: Record<AssignedExamListStatusLabel, number> = {
  Continue: 0,
  Start: 1,
  Locked: 2,
  Submitted: 3,
};

const buildAction = (
  label: AssignedExamListStatusLabel,
  href: string | null,
  disabled: boolean,
): AssignedExamActionViewModel => ({
  label,
  href,
  disabled,
});

const resolveLockedHelperText = (record: AssignedExamRecord): string => {
  if (record.isManuallyBlocked) {
    return "Locked by the examiner. Contact the exam team if you need access.";
  }

  if (record.windowStatus === "UPCOMING") {
    return "This exam has not opened yet. Start becomes available inside the exam window.";
  }

  return "The exam window has closed. New attempts can no longer be started.";
};

const resolveStatusPresentation = (
  record: AssignedExamRecord,
): Pick<
  AssignedExamListItemViewModel,
  "statusLabel" | "statusTone" | "helperText" | "action"
> => {
  if (record.attempt?.status === "IN_PROGRESS") {
    return {
      statusLabel: "Continue",
      statusTone: "active",
      helperText:
        "An active attempt is in progress. Resume through the attempt workspace.",
      action: buildAction(
        "Continue",
        `/student/attempts/${record.attempt.attemptId}`,
        false,
      ),
    };
  }

  if (
    record.attempt !== null &&
    CLOSED_ATTEMPT_STATUSES.includes(record.attempt.status)
  ) {
    return {
      statusLabel: "Submitted",
      statusTone: "completed",
      helperText:
        "This attempt is closed. Published results will appear in the student results area later.",
      action: buildAction("Submitted", null, true),
    };
  }

  if (record.isManuallyBlocked || record.windowStatus !== "OPEN") {
    return {
      statusLabel: "Locked",
      statusTone: "locked",
      helperText: resolveLockedHelperText(record),
      action: buildAction("Locked", `/student/exams/${record.examId}/start`, false),
    };
  }

  return {
    statusLabel: "Start",
    statusTone: "ready",
    helperText:
      "The exam is available now. Starting creates the timed attempt and loads the question session.",
    action: buildAction("Start", `/student/exams/${record.examId}/start`, false),
  };
};

export const buildAssignedExamListItem = (
  record: AssignedExamRecord,
): AssignedExamListItemViewModel => ({
  assignmentId: record.assignmentId,
  examId: record.examId,
  examTitle: record.examTitle,
  examCode: record.examCode,
  durationMinutes: record.durationMinutes,
  windowStartsAt: record.windowStartsAt,
  windowEndsAt: record.windowEndsAt,
  ...resolveStatusPresentation(record),
});

export const buildAssignedExamListViewModel = (
  records: readonly AssignedExamRecord[],
): AssignedExamListItemViewModel[] =>
  records
    .map(buildAssignedExamListItem)
    .sort((left, right) => {
      const priorityDifference =
        STATUS_PRIORITY[left.statusLabel] - STATUS_PRIORITY[right.statusLabel];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return left.windowStartsAt.getTime() - right.windowStartsAt.getTime();
    });

export const summarizeAssignedExamList = (
  items: readonly AssignedExamListItemViewModel[],
): AssignedExamListSummary => {
  const summary: AssignedExamListSummary = {
    total: items.length,
    startCount: 0,
    continueCount: 0,
    lockedCount: 0,
    submittedCount: 0,
    actionableCount: 0,
  };

  items.forEach((item) => {
    switch (item.statusLabel) {
      case "Start":
        summary.startCount += 1;
        summary.actionableCount += 1;
        break;
      case "Continue":
        summary.continueCount += 1;
        summary.actionableCount += 1;
        break;
      case "Locked":
        summary.lockedCount += 1;
        break;
      case "Submitted":
        summary.submittedCount += 1;
        break;
    }
  });

  return summary;
};
