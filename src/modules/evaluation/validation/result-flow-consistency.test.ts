import assert from "node:assert/strict";
import test from "node:test";

import {
  publishReadyExaminerResults,
} from "../utils/examiner-results-overview";
import {
  completeManualReviewAndRefreshReadiness,
} from "../utils/review-completion";
import {
  buildStudentResultDetailViewModel,
  listPublishedStudentResultSummaries,
} from "../utils/student-result-detail";

test("result flow stays consistent from review completion to student visibility", () => {
  const initial = {
    attemptId: "attempt-1",
    objectiveScores: [
      { attemptAnswerId: "obj-1", marksAwarded: 4, maxMarks: 5 },
      { attemptAnswerId: "obj-2", marksAwarded: 5, maxMarks: 5 },
    ],
    subjectiveAnswerCount: 2,
    subjectiveMaxScore: 10,
    reviewedSubjectiveScores: [],
    resultStatus: "PENDING_REVIEW" as const,
    attemptStatus: "UNDER_REVIEW" as const,
  };

  const afterReview1 = completeManualReviewAndRefreshReadiness(initial, {
    attemptAnswerId: "sub-1",
    marksAwarded: 4,
    maxMarks: 5,
  }).state;

  assert.equal(afterReview1.resultStatus, "PENDING_REVIEW");

  const afterReview2 = completeManualReviewAndRefreshReadiness(afterReview1, {
    attemptAnswerId: "sub-2",
    marksAwarded: 3,
    maxMarks: 5,
  }).state;

  assert.equal(afterReview2.resultStatus, "READY");

  const publishResult = publishReadyExaminerResults({
    items: [
      {
        resultId: "result-1",
        examId: "exam-dbms",
        examTitle: "DBMS Midterm",
        examCode: "DBMS-301",
        examinerId: "examiner-1",
        studentId: "student-1",
        studentName: "Aarav Singh",
        resultStatus: afterReview2.resultStatus,
        pendingSubjectiveCount: 0,
        finalScore: 16,
        percentage: 80,
        submittedAt: new Date("2026-04-12T08:35:00.000Z"),
        publishedAt: null,
      },
    ],
    resultIds: ["result-1"],
  });

  assert.equal(publishResult.publishedCount, 1);
  assert.equal(publishResult.updatedItems[0]?.resultStatus, "PUBLISHED");

  const studentRecords = [
    {
      resultId: "result-1",
      examId: "exam-dbms",
      examTitle: "DBMS Midterm",
      examCode: "DBMS-301",
      studentId: "student-1",
      studentName: "Aarav Singh",
      status: publishResult.updatedItems[0]?.resultStatus ?? "READY",
      scoreBreakdown: {
        objective: { earned: 9, possible: 10 },
        subjective: { earned: 7, possible: 10 },
        final: { earned: 16, possible: 20 },
        percentage: 80,
      },
      gradeLabel: "A",
      publishedAt: publishResult.updatedItems[0]?.publishedAt ?? null,
      feedbackItems: [
        {
          attemptAnswerId: "sub-1",
          questionOrder: 1,
          questionStem: "Explain ACID",
          marksAwarded: 4,
          maxMarks: 5,
          feedback: "Clear explanation.",
        },
      ],
    },
  ];

  const summaries = listPublishedStudentResultSummaries(studentRecords);
  assert.equal(summaries.length, 1);

  const detail = buildStudentResultDetailViewModel(studentRecords[0]!);
  assert.equal(detail.header.statusLabel, "Published");
  assert.equal(detail.scorecards[2]?.score, "16/20");
});
