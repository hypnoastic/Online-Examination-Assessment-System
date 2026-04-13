import assert from "node:assert/strict";
import test from "node:test";

import type { AttemptSessionPayload } from "../domain/attempt-session.types";
import {
  buildAttemptAutosaveFingerprint,
  buildAttemptAutosaveIndicator,
  createAttemptAutosaveSnapshot,
  parseAttemptAutosaveSnapshot,
  recoverAttemptWorkspaceState,
  serializeAttemptAutosaveSnapshot,
} from "../utils/attempt-autosave";
import {
  createAttemptWorkspaceState,
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

test("autosave snapshots round-trip the active draft state for recovery", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = setAttemptSingleSelectAnswer(state, "q-1", "q-1-b");
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-a");
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-c");
  state = setAttemptTextAnswer(
    state,
    "q-3",
    "Serializable schedules prevent inconsistent reads.",
  );
  state = toggleAttemptMarkedForReview(state, "q-3");
  state = setAttemptSingleSelectAnswer(state, "q-4", "q-4-b");
  state = {
    ...state,
    currentQuestionIndex: 2,
  };

  const savedAt = new Date("2026-04-12T04:48:00.000Z");
  const snapshot = createAttemptAutosaveSnapshot(
    baseSession.attemptId,
    baseSession,
    state,
    savedAt,
  );
  const recovered = recoverAttemptWorkspaceState(
    baseSession.attemptId,
    baseSession,
    parseAttemptAutosaveSnapshot(serializeAttemptAutosaveSnapshot(snapshot)),
  );

  assert.equal(recovered.recovered, true);
  assert.equal(recovered.savedAt?.toISOString(), savedAt.toISOString());
  assert.equal(recovered.state.currentQuestionIndex, 2);
  assert.deepEqual(recovered.state.drafts["q-1"]?.selectedOptionIds, ["q-1-b"]);
  assert.deepEqual(recovered.state.drafts["q-2"]?.selectedOptionIds, [
    "q-2-a",
    "q-2-c",
  ]);
  assert.equal(
    recovered.state.drafts["q-3"]?.textResponse,
    "Serializable schedules prevent inconsistent reads.",
  );
  assert.equal(recovered.state.drafts["q-3"]?.markedForReview, true);
  assert.deepEqual(recovered.state.drafts["q-4"]?.selectedOptionIds, ["q-4-b"]);
});

test("recovery ignores mismatched attempts and invalid saved options", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = setAttemptSingleSelectAnswer(state, "q-1", "q-1-a");
  state = toggleAttemptMultiSelectAnswer(state, "q-2", "q-2-b");
  state = setAttemptTextAnswer(state, "q-3", "Recovered text answer.");
  state = {
    ...state,
    currentQuestionIndex: 99,
  };

  const snapshot = createAttemptAutosaveSnapshot(
    baseSession.attemptId,
    baseSession,
    state,
    new Date("2026-04-12T04:52:00.000Z"),
  );

  snapshot.drafts[0] = {
    ...snapshot.drafts[0]!,
    type: "LONG_TEXT",
    selectedOptionIds: ["missing-option"],
    textResponse: "Should not hydrate into a single choice question.",
  };
  snapshot.drafts[1] = {
    ...snapshot.drafts[1]!,
    selectedOptionIds: ["q-2-b", "missing-option"],
  };

  const mismatchedAttempt = recoverAttemptWorkspaceState(
    "attempt-other",
    baseSession,
    snapshot,
  );
  const recovered = recoverAttemptWorkspaceState(
    baseSession.attemptId,
    baseSession,
    snapshot,
  );

  assert.equal(mismatchedAttempt.recovered, false);
  assert.equal(mismatchedAttempt.savedAt, null);
  assert.equal(mismatchedAttempt.state.currentQuestionIndex, 0);

  assert.equal(recovered.recovered, true);
  assert.equal(recovered.state.currentQuestionIndex, 3);
  assert.deepEqual(recovered.state.drafts["q-1"]?.selectedOptionIds, []);
  assert.equal(recovered.state.drafts["q-1"]?.textResponse, "");
  assert.deepEqual(recovered.state.drafts["q-2"]?.selectedOptionIds, ["q-2-b"]);
  assert.equal(recovered.state.drafts["q-3"]?.textResponse, "Recovered text answer.");
});

test("autosave indicators expose clear saving, saved, and failed states", () => {
  assert.deepEqual(buildAttemptAutosaveIndicator("saving"), {
    tone: "warning",
    label: "Saving locally",
    detail: "Latest answer changes are being written to local recovery storage.",
  });

  assert.deepEqual(buildAttemptAutosaveIndicator("saved"), {
    tone: "positive",
    label: "Saved locally",
    detail:
      "This browser can recover the active attempt after a refresh or re-entry.",
  });

  assert.deepEqual(
    buildAttemptAutosaveIndicator("failed", "Quota exceeded."),
    {
      tone: "critical",
      label: "Autosave failed",
      detail: "Quota exceeded.",
    },
  );
});

test("autosave fingerprints remain stable for unchanged attempt drafts", () => {
  let state = createAttemptWorkspaceState(baseSession);

  state = setAttemptSingleSelectAnswer(state, "q-1", "q-1-a");

  const firstFingerprint = buildAttemptAutosaveFingerprint(baseSession, state);
  const secondFingerprint = buildAttemptAutosaveFingerprint(baseSession, {
    ...state,
  });

  assert.equal(firstFingerprint, secondFingerprint);
});
