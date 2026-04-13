import assert from "node:assert/strict";
import test from "node:test";

import type { AttemptSessionPayload } from "../domain/attempt-session.types";
import {
  applyAttemptAutoSubmit,
  buildAttemptSubmissionPresentation,
  buildAttemptSubmissionSummary,
  closeAttemptSubmissionConfirmation,
  completeAttemptSubmission,
  createInitialAttemptSubmissionState,
  isAttemptFinalized,
  isAttemptInteractionLocked,
  isAttemptSubmissionBusy,
  openAttemptSubmissionConfirmation,
  startAttemptSubmission,
} from "../utils/attempt-submission";
import {
  createAttemptWorkspaceState,
  setAttemptSingleSelectAnswer,
  setAttemptTextAnswer,
  toggleAttemptMarkedForReview,
} from "../utils/attempt-workspace";

const baseSession: AttemptSessionPayload = {
  attemptId: "attempt-dbms-bootstrap",
  examId: "exam-dbms",
  examTitle: "DBMS Midterm",
  examCode: "DBMS-301",
  durationMinutes: 90,
  status: "IN_PROGRESS",
  startedAt: new Date("2026-04-12T04:30:00.000Z"),
  expiresAt: new Date("2026-04-12T06:00:00.000Z"),
  questionCount: 4,
  instructions: ["Read carefully."],
  questions: [
    {
      examQuestionId: "q-1",
      questionId: "question-1",
      questionOrder: 1,
      type: "SINGLE_CHOICE",
      reviewMode: "OBJECTIVE",
      stem: "Choose one option.",
      maxMarks: 2,
      options: [
        { id: "q-1-a", label: "A", text: "Alpha" },
        { id: "q-1-b", label: "B", text: "Beta" },
      ],
    },
    {
      examQuestionId: "q-2",
      questionId: "question-2",
      questionOrder: 2,
      type: "MULTIPLE_CHOICE",
      reviewMode: "OBJECTIVE",
      stem: "Choose multiple options.",
      maxMarks: 3,
      options: [
        { id: "q-2-a", label: "A", text: "TLS" },
        { id: "q-2-b", label: "B", text: "ARP" },
        { id: "q-2-c", label: "C", text: "HTTPS" },
      ],
    },
    {
      examQuestionId: "q-3",
      questionId: "question-3",
      questionOrder: 3,
      type: "SHORT_TEXT",
      reviewMode: "MANUAL",
      stem: "Short text response.",
      maxMarks: 4,
    },
    {
      examQuestionId: "q-4",
      questionId: "question-4",
      questionOrder: 4,
      type: "TRUE_FALSE",
      reviewMode: "OBJECTIVE",
      stem: "True or false.",
      maxMarks: 1,
      options: [
        { id: "q-4-a", label: "A", text: "True" },
        { id: "q-4-b", label: "B", text: "False" },
      ],
    },
  ],
};

test("submit summary counts answered, unanswered, and marked questions clearly", () => {
  let workspaceState = createAttemptWorkspaceState(baseSession);

  workspaceState = setAttemptSingleSelectAnswer(workspaceState, "q-1", "q-1-a");
  workspaceState = setAttemptTextAnswer(
    workspaceState,
    "q-3",
    "Recovered draft answer.",
  );
  workspaceState = toggleAttemptMarkedForReview(workspaceState, "q-4");

  const summary = buildAttemptSubmissionSummary(baseSession, workspaceState);

  assert.deepEqual(summary, {
    totalQuestions: 4,
    answeredCount: 2,
    unansweredCount: 2,
    markedCount: 1,
    answeredQuestionOrders: [1, 3],
    unansweredQuestionOrders: [2, 4],
    markedQuestionOrders: [4],
  });
});

test("submit confirmation state opens, closes, and finalizes without duplicate ambiguity", () => {
  const finalizedAt = new Date("2026-04-12T05:20:00.000Z");
  const activeState = createInitialAttemptSubmissionState();
  const confirmingState = openAttemptSubmissionConfirmation(activeState);
  const closedState = closeAttemptSubmissionConfirmation(confirmingState);
  const submittingState = startAttemptSubmission(confirmingState);
  const duplicateSubmitState = startAttemptSubmission(submittingState);
  const submittedState = completeAttemptSubmission(submittingState, finalizedAt);
  const repeatedCompletionState = completeAttemptSubmission(
    submittedState,
    new Date("2026-04-12T05:21:00.000Z"),
  );

  assert.equal(confirmingState.phase, "confirming");
  assert.equal(closedState.phase, "active");
  assert.equal(submittingState.phase, "submitting");
  assert.deepEqual(duplicateSubmitState, submittingState);
  assert.equal(isAttemptSubmissionBusy(submittingState), true);
  assert.equal(submittedState.phase, "submitted");
  assert.equal(submittedState.finalizedAt?.toISOString(), finalizedAt.toISOString());
  assert.equal(submittedState.finalizationReason, "manual");
  assert.deepEqual(repeatedCompletionState, submittedState);
  assert.equal(isAttemptFinalized(submittedState), true);
  assert.equal(isAttemptInteractionLocked(submittedState), true);
});

test("timeout handling produces one stable auto-submitted final state", () => {
  const timeoutAt = new Date("2026-04-12T06:00:00.000Z");
  const activeState = createInitialAttemptSubmissionState();
  const autoSubmittedState = applyAttemptAutoSubmit(activeState, timeoutAt);
  const repeatedTimeoutState = applyAttemptAutoSubmit(
    autoSubmittedState,
    new Date("2026-04-12T06:01:00.000Z"),
  );
  const manuallyCompletedState = completeAttemptSubmission(
    openAttemptSubmissionConfirmation(activeState),
    new Date("2026-04-12T05:50:00.000Z"),
  );

  assert.equal(autoSubmittedState.phase, "auto_submitted");
  assert.equal(autoSubmittedState.finalizedAt?.toISOString(), timeoutAt.toISOString());
  assert.equal(autoSubmittedState.finalizationReason, "timeout");
  assert.deepEqual(repeatedTimeoutState, autoSubmittedState);
  assert.deepEqual(manuallyCompletedState, openAttemptSubmissionConfirmation(activeState));
});

test("submission presentation explains unanswered and timeout outcomes", () => {
  let workspaceState = createAttemptWorkspaceState(baseSession);

  workspaceState = setAttemptSingleSelectAnswer(workspaceState, "q-1", "q-1-b");

  const summary = buildAttemptSubmissionSummary(baseSession, workspaceState);
  const confirmingView = buildAttemptSubmissionPresentation(
    openAttemptSubmissionConfirmation(createInitialAttemptSubmissionState()),
    summary,
  );
  const timeoutView = buildAttemptSubmissionPresentation(
    applyAttemptAutoSubmit(createInitialAttemptSubmissionState(), new Date("2026-04-12T06:00:00.000Z")),
    summary,
  );

  assert.equal(confirmingView.statusLabel, "Ready to Submit");
  assert.match(confirmingView.detail, /3 questions will be submitted unanswered/i);
  assert.equal(timeoutView.statusLabel, "Auto-Submitted");
  assert.match(timeoutView.detail, /timeout forced submission/i);
});
