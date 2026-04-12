import type { StudentAttemptStatus } from "../domain/assigned-exam.types";
import type {
  AttemptBootstrapRecord,
  AttemptSessionLoadResult,
  AttemptSessionPayload,
  AttemptStartBlockReason,
  AttemptStartEntryViewModel,
} from "../domain/attempt-session.types";
import { toBootstrapAttemptId } from "./attempt-identifiers.ts";

const CLOSED_ATTEMPT_STATUSES: readonly StudentAttemptStatus[] = [
  "SUBMITTED",
  "AUTO_SUBMITTED",
  "UNDER_REVIEW",
  "EVALUATED",
];

const toExpiryTime = (startedAt: Date, durationMinutes: number): Date =>
  new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

const buildSessionPayload = (
  record: AttemptBootstrapRecord,
  attemptId: string,
  startedAt: Date,
  expiresAt: Date,
): AttemptSessionPayload => ({
  attemptId,
  examId: record.examId,
  examTitle: record.examTitle,
  examCode: record.examCode,
  durationMinutes: record.durationMinutes,
  status: "IN_PROGRESS",
  startedAt,
  expiresAt,
  questionCount: record.sessionTemplate.questions.length,
  instructions: record.sessionTemplate.instructions,
  questions: [...record.sessionTemplate.questions].sort(
    (left, right) => left.questionOrder - right.questionOrder,
  ),
});

const buildBlockedEntry = (
  reason: AttemptStartBlockReason,
  title: string,
  message: string,
): AttemptStartEntryViewModel => ({
  outcome: "BLOCKED",
  tone: "blocked",
  title,
  message,
  actionLabel: "Back to Dashboard",
  actionHref: "/student",
  blockReason: reason,
  session: null,
});

export const resolveExamStartEntry = (
  record: AttemptBootstrapRecord | null,
  now: Date = new Date(),
): AttemptStartEntryViewModel => {
  if (record === null) {
    return buildBlockedEntry(
      "NOT_ASSIGNED",
      "Exam assignment not found",
      "The requested exam is not assigned to this student account, so a new attempt cannot be created.",
    );
  }

  if (record.attempt?.status === "IN_PROGRESS") {
    const expiresAt = record.attempt.expiresAt ?? toExpiryTime(record.attempt.startedAt, record.durationMinutes);

    return {
      outcome: "RESUME_ACTIVE",
      tone: "resume",
      title: "Active attempt found",
      message:
        "An in-progress attempt already exists for this exam. Resume the current attempt instead of creating a duplicate start.",
      actionLabel: "Resume Attempt",
      actionHref: `/student/attempts/${record.attempt.attemptId}`,
      blockReason: null,
      session: buildSessionPayload(
        record,
        record.attempt.attemptId,
        record.attempt.startedAt,
        expiresAt,
      ),
    };
  }

  if (
    record.attempt !== null &&
    CLOSED_ATTEMPT_STATUSES.includes(record.attempt.status)
  ) {
    return buildBlockedEntry(
      "ALREADY_SUBMITTED",
      "Attempt already completed",
      "This exam already has a closed attempt, so the student cannot start it again or reopen the submitted work.",
    );
  }

  if (record.isManuallyBlocked) {
    return buildBlockedEntry(
      "MANUALLY_BLOCKED",
      "Exam access is manually blocked",
      "The examiner has blocked access to this exam. Contact the exam team if you expect the start action to be available.",
    );
  }

  if (record.windowStatus === "UPCOMING") {
    return buildBlockedEntry(
      "WINDOW_NOT_OPEN",
      "Exam has not opened yet",
      "The schedule window has not started, so the student must wait until the published start time before beginning the attempt.",
    );
  }

  if (record.windowStatus === "CLOSED") {
    return buildBlockedEntry(
      "WINDOW_CLOSED",
      "Exam window is closed",
      "The exam window has already ended. New attempts are blocked after the scheduled end time.",
    );
  }

  const attemptId = toBootstrapAttemptId(record.examId);
  const startedAt = now;
  const expiresAt = toExpiryTime(startedAt, record.durationMinutes);

  return {
    outcome: "READY_TO_START",
    tone: "ready",
    title: "Exam ready to start",
    message:
      "Eligibility checks passed. The attempt bootstrap is ready and the question session has been prepared for entry.",
    actionLabel: "Enter Exam",
    actionHref: `/student/attempts/${attemptId}`,
    blockReason: null,
    session: buildSessionPayload(record, attemptId, startedAt, expiresAt),
  };
};

const buildSessionBlockedResult = (
  reason: AttemptStartBlockReason,
  title: string,
  message: string,
): AttemptSessionLoadResult => ({
  status: "BLOCKED",
  title,
  message,
  blockReason: reason,
  session: null,
});

export const resolveAttemptSessionEntry = (
  records: readonly AttemptBootstrapRecord[],
  attemptId: string,
  now: Date = new Date(),
): AttemptSessionLoadResult => {
  const matchingRecord =
    records.find((record) => record.attempt?.attemptId === attemptId) ??
    records.find(
      (record) =>
        record.attempt === null && toBootstrapAttemptId(record.examId) === attemptId,
    ) ??
    null;

  if (matchingRecord === null) {
    return buildSessionBlockedResult(
      "ATTEMPT_NOT_FOUND",
      "Attempt session not found",
      "The requested attempt could not be matched to an assigned exam for this student.",
    );
  }

  if (matchingRecord.attempt?.attemptId === attemptId) {
    if (matchingRecord.attempt.status !== "IN_PROGRESS") {
      return buildSessionBlockedResult(
        "ATTEMPT_NOT_ACTIVE",
        "Attempt is no longer active",
        "This attempt has already been finalized, so the live question session cannot be reopened.",
      );
    }

    return {
      status: "READY",
      title: "Question session restored",
      message:
        "The saved in-progress attempt was found and restored through the student attempt route.",
      blockReason: null,
      session: buildSessionPayload(
        matchingRecord,
        matchingRecord.attempt.attemptId,
        matchingRecord.attempt.startedAt,
        matchingRecord.attempt.expiresAt ??
          toExpiryTime(
            matchingRecord.attempt.startedAt,
            matchingRecord.durationMinutes,
          ),
      ),
    };
  }

  const startEntry = resolveExamStartEntry(matchingRecord, now);

  if (startEntry.outcome === "BLOCKED" || startEntry.session === null) {
    return buildSessionBlockedResult(
      startEntry.blockReason ?? "ATTEMPT_NOT_ACTIVE",
      startEntry.title,
      startEntry.message,
    );
  }

  return {
    status: "READY",
    title: "Question session loaded",
    message:
      "A new attempt bootstrap was created from the eligible exam start route and the question session is ready for the exam-taking screen.",
    blockReason: null,
    session: startEntry.session,
  };
};
