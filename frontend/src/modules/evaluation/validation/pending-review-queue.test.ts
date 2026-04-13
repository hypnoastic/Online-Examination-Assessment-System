import assert from "node:assert/strict";
import test from "node:test";

import type { PendingReviewQueueItem } from "../domain/review-queue.types";
import {
  assertExaminerQueueAccess,
  buildPendingReviewQueueViewModel,
  groupPendingReviewItems,
  listPendingReviewItems,
  toPendingReviewQueueRows,
} from "../utils/pending-review-queue";

const sampleQueue: PendingReviewQueueItem[] = [
  {
    attemptId: "attempt-1",
    attemptAnswerId: "answer-1",
    examId: "exam-dbms",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    examinerId: "examiner-1",
    studentId: "student-1",
    studentName: "Aarav Singh",
    questionType: "LONG_TEXT",
    resultStatus: "PENDING_REVIEW",
    attemptStatus: "UNDER_REVIEW",
    pendingSubjectiveCount: 2,
    submittedAt: new Date("2026-04-12T08:30:00.000Z"),
  },
  {
    attemptId: "attempt-2",
    attemptAnswerId: "answer-2",
    examId: "exam-dbms",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    examinerId: "examiner-1",
    studentId: "student-2",
    studentName: "Meera Nair",
    questionType: "SHORT_TEXT",
    resultStatus: "PENDING_REVIEW",
    attemptStatus: "UNDER_REVIEW",
    pendingSubjectiveCount: 1,
    submittedAt: new Date("2026-04-12T08:35:00.000Z"),
  },
  {
    attemptId: "attempt-3",
    attemptAnswerId: "answer-3",
    examId: "exam-os",
    examTitle: "Operating Systems Quiz",
    examCode: "OS-210",
    examinerId: "examiner-1",
    studentId: "student-3",
    studentName: "Riya Shah",
    questionType: "LONG_TEXT",
    resultStatus: "READY",
    attemptStatus: "EVALUATED",
    pendingSubjectiveCount: 0,
    submittedAt: new Date("2026-04-12T08:20:00.000Z"),
  },
];

test("pending review items render queue rows with exam/student/status context", () => {
  const filtered = listPendingReviewItems(sampleQueue);
  const rows = toPendingReviewQueueRows(filtered);

  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    attemptAnswerId: "answer-2",
    exam: "DBMS Midterm (DBMS-301)",
    student: "Meera Nair",
    reviewStatus: "PENDING_REVIEW",
    pendingCount: 1,
    submittedAtIso: "2026-04-12T08:35:00.000Z",
  });
});

test("empty queue state is clean when no pending review items match", () => {
  const viewModel = buildPendingReviewQueueViewModel(sampleQueue, {
    examId: "missing-exam",
  });

  assert.equal(viewModel.totalItems, 0);
  assert.deepEqual(viewModel.sections, []);
  assert.deepEqual(viewModel.emptyState, {
    title: "No Pending Reviews",
    description:
      "All subjective responses are reviewed for the current filter scope.",
  });
});

test("queue filters and grouping are deterministic", () => {
  const filtered = listPendingReviewItems(sampleQueue, {
    query: "dbms",
  });

  const groupedByExam = groupPendingReviewItems(filtered, "EXAM");
  const groupedByStudent = groupPendingReviewItems(filtered, "STUDENT");

  assert.equal(filtered.length, 2);
  assert.equal(groupedByExam.length, 1);
  assert.equal(groupedByExam[0]?.label, "DBMS Midterm (DBMS-301)");
  assert.equal(groupedByStudent.length, 2);
  assert.equal(groupedByStudent[0]?.items.length, 1);
});

test("role protection blocks non-examiner or cross-owner access", () => {
  assert.doesNotThrow(() =>
    assertExaminerQueueAccess({
      actorId: "examiner-1",
      actorRole: "EXAMINER",
      examinerId: "examiner-1",
    }),
  );

  assert.throws(() =>
    assertExaminerQueueAccess({
      actorId: "student-1",
      actorRole: "STUDENT",
      examinerId: "examiner-1",
    }),
  );

  assert.throws(() =>
    assertExaminerQueueAccess({
      actorId: "examiner-2",
      actorRole: "EXAMINER",
      examinerId: "examiner-1",
    }),
  );
});
