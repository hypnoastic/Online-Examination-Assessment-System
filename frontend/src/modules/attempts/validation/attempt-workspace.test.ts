import assert from "node:assert/strict";
import test from "node:test";

import type { AttemptSessionPayload } from "../domain/attempt-session.types";
import {
  buildAttemptQuestionNavigationItems,
  createAttemptWorkspaceState,
  goToAttemptQuestion,
  goToNextAttemptQuestion,
  goToPreviousAttemptQuestion,
  isAttemptQuestionAnswered,
  setAttemptSingleSelectAnswer,
  setAttemptTextAnswer,
  toggleAttemptMarkedForReview,
  toggleAttemptMultiSelectAnswer,
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
  questionCount: 5,
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
      type: "TRUE_FALSE",
      reviewMode: "OBJECTIVE",
      stem: "True or false.",
      maxMarks: 1,
      options: [
        { id: "q-3-a", label: "A", text: "True" },
        { id: "q-3-b", label: "B", text: "False" },
      ],
    },
    {
      examQuestionId: "q-4",
      questionId: "question-4",
      questionOrder: 4,
      type: "SHORT_TEXT",
      reviewMode: "MANUAL",
      stem: "Short text response.",
      maxMarks: 4,
    },
    {
      examQuestionId: "q-5",
      questionId: "question-5",
      questionOrder: 5,
      type: "LONG_TEXT",
      reviewMode: "MANUAL",
      stem: "Long text response.",
      maxMarks: 8,
    },
  ],
};

test("workspace supports answers across all supported question types", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = setAttemptSingleSelectAnswer(state, "q-1", "q-1-b");
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-a");
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-c");
  state = setAttemptSingleSelectAnswer(state, "q-3", "q-3-b");
  state = setAttemptTextAnswer(state, "q-4", "Serializable schedules avoid drift.");
  state = setAttemptTextAnswer(
    state,
    "q-5",
    "A longer explanation can include constraints, tradeoffs, and implementation details.",
  );

  assert.deepEqual(state.drafts["q-1"]?.selectedOptionIds, ["q-1-b"]);
  assert.deepEqual(state.drafts["q-2"]?.selectedOptionIds, ["q-2-a", "q-2-c"]);
  assert.deepEqual(state.drafts["q-3"]?.selectedOptionIds, ["q-3-b"]);
  assert.equal(
    state.drafts["q-4"]?.textResponse,
    "Serializable schedules avoid drift.",
  );
  assert.match(
    state.drafts["q-5"]?.textResponse ?? "",
    /tradeoffs, and implementation details/i,
  );

  ["q-1", "q-2", "q-3", "q-4", "q-5"].forEach((examQuestionId) => {
    assert.equal(isAttemptQuestionAnswered(state.drafts[examQuestionId]!), true);
  });
});

test("question navigation preserves local answer state while moving back and forth", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = setAttemptSingleSelectAnswer(state, "q-1", "q-1-a");
  state = goToNextAttemptQuestion(state, baseSession);
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-c");
  state = goToAttemptQuestion(state, baseSession, 4);
  state = setAttemptTextAnswer(state, "q-5", "Long-form draft answer.");
  state = goToPreviousAttemptQuestion(state, baseSession);
  state = goToAttemptQuestion(state, baseSession, 0);

  assert.equal(state.currentQuestionIndex, 0);
  assert.deepEqual(state.drafts["q-1"]?.selectedOptionIds, ["q-1-a"]);
  assert.deepEqual(state.drafts["q-2"]?.selectedOptionIds, ["q-2-c"]);
  assert.equal(state.drafts["q-5"]?.textResponse, "Long-form draft answer.");
  assert.equal(state.drafts["q-5"]?.visited, true);
});

test("marked-for-review state is visible in the question navigation model", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = goToAttemptQuestion(state, baseSession, 2);
  state = toggleAttemptMarkedForReview(state, "q-3");
  state = setAttemptSingleSelectAnswer(state, "q-3", "q-3-a");

  const items = buildAttemptQuestionNavigationItems(baseSession, state);
  const markedItem = items.find((item) => item.examQuestionId === "q-3");

  assert.equal(markedItem?.isMarkedForReview, true);
  assert.equal(markedItem?.isAnswered, true);
  assert.equal(markedItem?.statusLabel, "Current • Marked");
});
