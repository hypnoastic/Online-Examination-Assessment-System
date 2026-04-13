import assert from "node:assert/strict";
import test from "node:test";

import type { GradingWorkspaceItem } from "../domain/grading-workspace.types";
import {
  buildGradingWorkspaceViewModel,
  createManualReviewEntry,
  getNextPendingAttemptAnswerId,
  getPreviousPendingAttemptAnswerId,
  validateMarksAwarded,
} from "../utils/grading-workspace";

const queueItems: GradingWorkspaceItem[] = [
  {
    attemptId: "attempt-1",
    attemptAnswerId: "answer-1",
    examId: "exam-1",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    studentId: "student-1",
    studentName: "Aarav Singh",
    questionType: "LONG_TEXT",
    questionStem: "Explain ACID properties in transaction systems.",
    modelAnswerText: "Atomicity, Consistency, Isolation, Durability.",
    studentAnswerText:
      "Atomicity means all-or-nothing transaction behavior.\n\nConsistency ensures constraint-safe state changes.\n\nIsolation avoids interference across concurrent transactions.",
    maxMarks: 10,
    submittedAt: new Date("2026-04-12T08:30:00.000Z"),
  },
  {
    attemptId: "attempt-2",
    attemptAnswerId: "answer-2",
    examId: "exam-1",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    studentId: "student-2",
    studentName: "Meera Nair",
    questionType: "SHORT_TEXT",
    questionStem: "Define normalization.",
    modelAnswerText: "Reducing redundancy through normal forms.",
    studentAnswerText: "Normalization removes redundancy.",
    maxMarks: 5,
    submittedAt: new Date("2026-04-12T08:35:00.000Z"),
  },
  {
    attemptId: "attempt-3",
    attemptAnswerId: "answer-3",
    examId: "exam-2",
    examTitle: "OS Quiz",
    examCode: "OS-210",
    studentId: "student-3",
    studentName: "Riya Shah",
    questionType: "SHORT_TEXT",
    questionStem: "What is a semaphore?",
    studentAnswerText: "A synchronization primitive.",
    maxMarks: 4,
    submittedAt: new Date("2026-04-12T08:20:00.000Z"),
  },
];

test("marks are accepted only within valid range", () => {
  assert.doesNotThrow(() => validateMarksAwarded(0, 10));
  assert.doesNotThrow(() => validateMarksAwarded(10, 10));
  assert.throws(() => validateMarksAwarded(-1, 10));
  assert.throws(() => validateMarksAwarded(11, 10));
});

test("feedback is stored correctly with safe normalization", () => {
  const review = createManualReviewEntry(
    queueItems[0],
    "examiner-1",
    {
      marksAwarded: 8,
      feedback: "  Good structure and accurate terminology.  ",
    },
    new Date("2026-04-12T10:15:00.000Z"),
  );

  assert.equal(review.marksAwarded, 8);
  assert.equal(review.feedback, "Good structure and accurate terminology.");
  assert.equal(review.reviewedAt.toISOString(), "2026-04-12T10:15:00.000Z");
});

test("workspace layout remains readable for long answers", () => {
  const viewModel = buildGradingWorkspaceViewModel(queueItems, "answer-1");

  assert.equal(viewModel.header.exam, "DBMS Midterm (DBMS-301)");
  assert.equal(viewModel.answerPanel.paragraphs.length, 3);
  assert.equal(viewModel.answerPanel.lineCount, 3);
  assert.equal(
    viewModel.answerPanel.paragraphs[1],
    "Consistency ensures constraint-safe state changes.",
  );
  assert.equal(viewModel.questionPanel.modelAnswer, "Atomicity, Consistency, Isolation, Durability.");
});

test("navigation between pending answers is deterministic", () => {
  const workspaceAtSecond = buildGradingWorkspaceViewModel(queueItems, "answer-1");

  assert.equal(workspaceAtSecond.navigation.total, 3);
  assert.equal(workspaceAtSecond.navigation.position, 2);
  assert.equal(workspaceAtSecond.navigation.previousAttemptAnswerId, "answer-2");
  assert.equal(workspaceAtSecond.navigation.nextAttemptAnswerId, "answer-3");

  assert.equal(getNextPendingAttemptAnswerId(queueItems, "answer-2"), "answer-1");
  assert.equal(getPreviousPendingAttemptAnswerId(queueItems, "answer-3"), "answer-1");
});
