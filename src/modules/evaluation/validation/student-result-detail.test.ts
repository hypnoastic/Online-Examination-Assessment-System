import assert from "node:assert/strict";
import test from "node:test";

import type { StudentResultRecord } from "../domain/student-result.types";
import {
  assertStudentResultAccess,
  buildStudentResultDetailViewModel,
  listPublishedStudentResultSummaries,
} from "../utils/student-result-detail";

const baseRecord: StudentResultRecord = {
  resultId: "result-1",
  examId: "exam-dbms",
  examTitle: "DBMS Midterm",
  examCode: "DBMS-301",
  studentId: "student-1",
  studentName: "Aarav Singh",
  status: "PUBLISHED",
  scoreBreakdown: {
    objective: { earned: 30, possible: 40 },
    subjective: { earned: 8, possible: 10 },
    final: { earned: 38, possible: 50 },
    percentage: 76,
  },
  gradeLabel: "B+",
  publishedAt: new Date("2026-04-12T09:00:00.000Z"),
  feedbackItems: [
    {
      attemptAnswerId: "sub-2",
      questionOrder: 2,
      questionStem: "Explain 2PL.",
      marksAwarded: 4,
      maxMarks: 5,
      feedback: "Good explanation with minor detail gaps.",
    },
    {
      attemptAnswerId: "sub-1",
      questionOrder: 1,
      questionStem: "Explain ACID.",
      marksAwarded: 4,
      maxMarks: 5,
      feedback: "Solid answer with clear definitions.",
    },
  ],
};

test("only published results are visible in student summaries", () => {
  const summaries = listPublishedStudentResultSummaries([
    baseRecord,
    {
      ...baseRecord,
      resultId: "result-2",
      status: "READY",
      publishedAt: null,
    },
  ]);

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.resultId, "result-1");
});

test("result detail view model is readable and accurate", () => {
  const viewModel = buildStudentResultDetailViewModel(baseRecord);

  assert.equal(viewModel.header.exam, "DBMS Midterm (DBMS-301)");
  assert.equal(viewModel.header.statusLabel, "Published");
  assert.equal(viewModel.scorecards[2]?.score, "38/50");
  assert.equal(viewModel.percentage, "76.00%");
  assert.equal(viewModel.feedbackPanel.totalFeedbackItems, 2);
  assert.equal(viewModel.feedbackPanel.items[0]?.questionOrder, 1);
  assert.equal(
    viewModel.feedbackPanel.items[0]?.feedback,
    "Solid answer with clear definitions.",
  );
});

test("student access guard enforces role, ownership, and published status", () => {
  assert.doesNotThrow(() =>
    assertStudentResultAccess(
      { actorId: "student-1", actorRole: "STUDENT" },
      baseRecord,
    ),
  );

  assert.throws(() =>
    assertStudentResultAccess(
      { actorId: "examiner-1", actorRole: "EXAMINER" },
      baseRecord,
    ),
  );

  assert.throws(() =>
    assertStudentResultAccess(
      { actorId: "student-2", actorRole: "STUDENT" },
      baseRecord,
    ),
  );

  assert.throws(() =>
    assertStudentResultAccess(
      { actorId: "student-1", actorRole: "STUDENT" },
      { ...baseRecord, status: "READY" },
    ),
  );
});
