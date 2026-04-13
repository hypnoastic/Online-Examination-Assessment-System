import assert from "node:assert/strict";
import test from "node:test";

import type { ExaminerResultOverviewItem } from "../domain/examiner-results.types";
import {
  assertExaminerResultOverviewAccess,
  buildExaminerResultOverviewViewModel,
  listExaminerResultOverviewItems,
  publishReadyExaminerResults,
} from "../utils/examiner-results-overview";

const sampleItems: ExaminerResultOverviewItem[] = [
  {
    resultId: "result-1",
    examId: "exam-dbms",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    examinerId: "examiner-1",
    studentId: "student-1",
    studentName: "Aarav Singh",
    resultStatus: "READY",
    pendingSubjectiveCount: 0,
    finalScore: 40,
    percentage: 80,
    submittedAt: new Date("2026-04-12T08:35:00.000Z"),
    publishedAt: null,
  },
  {
    resultId: "result-2",
    examId: "exam-dbms",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    examinerId: "examiner-1",
    studentId: "student-2",
    studentName: "Meera Nair",
    resultStatus: "PENDING_REVIEW",
    pendingSubjectiveCount: 1,
    finalScore: 32,
    percentage: 64,
    submittedAt: new Date("2026-04-12T08:30:00.000Z"),
    publishedAt: null,
  },
  {
    resultId: "result-3",
    examId: "exam-os",
    examTitle: "OS Quiz",
    examCode: "OS-210",
    examinerId: "examiner-1",
    studentId: "student-3",
    studentName: "Riya Shah",
    resultStatus: "PUBLISHED",
    pendingSubjectiveCount: 0,
    finalScore: 18,
    percentage: 90,
    submittedAt: new Date("2026-04-12T08:20:00.000Z"),
    publishedAt: new Date("2026-04-12T09:00:00.000Z"),
  },
];

test("examiner overview reflects correct status and publish-ready indicators", () => {
  const viewModel = buildExaminerResultOverviewViewModel(sampleItems);

  assert.equal(viewModel.total, 3);
  assert.deepEqual(viewModel.byStatus, {
    PENDING_REVIEW: 1,
    READY: 1,
    PUBLISHED: 1,
  });

  const readyRow = viewModel.rows.find((row) => row.resultId === "result-1");
  const pendingRow = viewModel.rows.find((row) => row.resultId === "result-2");

  assert.equal(readyRow?.publishIndicator.canPublish, true);
  assert.equal(readyRow?.publishIndicator.label, "READY_TO_PUBLISH");
  assert.equal(pendingRow?.publishIndicator.canPublish, false);
  assert.equal(pendingRow?.publishIndicator.label, "BLOCKED_PENDING_REVIEW");
});

test("ready results can be published via publish action", () => {
  const published = publishReadyExaminerResults({
    items: sampleItems,
    resultIds: ["result-1"],
  });

  assert.equal(published.publishedCount, 1);
  assert.equal(published.blockedCount, 0);
  assert.equal(
    published.updatedItems.find((item) => item.resultId === "result-1")?.resultStatus,
    "PUBLISHED",
  );
});

test("pending results remain blocked from publication", () => {
  const published = publishReadyExaminerResults({
    items: sampleItems,
    resultIds: ["result-2"],
  });

  assert.equal(published.publishedCount, 0);
  assert.equal(published.blockedCount, 1);
  assert.equal(
    published.updatedItems.find((item) => item.resultId === "result-2")?.resultStatus,
    "PENDING_REVIEW",
  );
});

test("role protection is enforced for examiner result overview", () => {
  assert.doesNotThrow(() =>
    assertExaminerResultOverviewAccess({
      actorId: "examiner-1",
      actorRole: "EXAMINER",
      examinerId: "examiner-1",
    }),
  );

  assert.throws(() =>
    assertExaminerResultOverviewAccess({
      actorId: "student-1",
      actorRole: "STUDENT",
      examinerId: "examiner-1",
    }),
  );

  assert.throws(() =>
    assertExaminerResultOverviewAccess({
      actorId: "examiner-2",
      actorRole: "EXAMINER",
      examinerId: "examiner-1",
    }),
  );
});

test("overview filters remain deterministic", () => {
  const filtered = listExaminerResultOverviewItems(sampleItems, {
    examId: "exam-dbms",
    query: "dbms",
  });

  assert.equal(filtered.length, 2);
  assert.equal(filtered[0]?.resultId, "result-1");
  assert.equal(filtered[1]?.resultId, "result-2");
});
