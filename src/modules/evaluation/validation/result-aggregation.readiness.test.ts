import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateSubmissionResult,
  type AggregatableAnswerScore,
} from "../utils/result-aggregation";

const objectiveScores: AggregatableAnswerScore[] = [
  {
    attemptAnswerId: "obj-1",
    marksAwarded: 4,
    maxMarks: 5,
  },
  {
    attemptAnswerId: "obj-2",
    marksAwarded: 5,
    maxMarks: 5,
  },
];

test("objective-only submissions move result to READY and attempt to EVALUATED", () => {
  const aggregation = aggregateSubmissionResult({
    objectiveScores,
    subjectiveAnswerCount: 0,
    subjectiveMaxScore: 0,
  });

  assert.equal(aggregation.resultStatus, "READY");
  assert.equal(aggregation.attemptStatus, "EVALUATED");
  assert.equal(aggregation.pendingSubjectiveCount, 0);
  assert.equal(aggregation.scoreBreakdown.final.earned, 9);
  assert.equal(aggregation.scoreBreakdown.final.possible, 10);
});

test("mixed submissions remain PENDING_REVIEW while subjective items are pending", () => {
  const aggregation = aggregateSubmissionResult({
    objectiveScores,
    reviewedSubjectiveScores: [],
    subjectiveAnswerCount: 2,
    subjectiveMaxScore: 10,
  });

  assert.equal(aggregation.resultStatus, "PENDING_REVIEW");
  assert.equal(aggregation.attemptStatus, "UNDER_REVIEW");
  assert.equal(aggregation.reviewedSubjectiveCount, 0);
  assert.equal(aggregation.pendingSubjectiveCount, 2);
  assert.equal(aggregation.scoreBreakdown.final.earned, 9);
  assert.equal(aggregation.scoreBreakdown.final.possible, 20);
});

test("once all subjective reviews are recorded, result becomes READY", () => {
  const aggregation = aggregateSubmissionResult({
    objectiveScores,
    reviewedSubjectiveScores: [
      {
        attemptAnswerId: "sub-1",
        marksAwarded: 3,
        maxMarks: 5,
      },
      {
        attemptAnswerId: "sub-2",
        marksAwarded: 4,
        maxMarks: 5,
      },
    ],
    subjectiveAnswerCount: 2,
    subjectiveMaxScore: 10,
  });

  assert.equal(aggregation.resultStatus, "READY");
  assert.equal(aggregation.attemptStatus, "EVALUATED");
  assert.equal(aggregation.pendingSubjectiveCount, 0);
  assert.equal(aggregation.scoreBreakdown.objective.earned, 9);
  assert.equal(aggregation.scoreBreakdown.subjective.earned, 7);
  assert.equal(aggregation.scoreBreakdown.final.earned, 16);
});

test("aggregation rejects duplicate answer IDs to prevent double-counting", () => {
  assert.throws(() =>
    aggregateSubmissionResult({
      objectiveScores: [
        {
          attemptAnswerId: "obj-1",
          marksAwarded: 5,
          maxMarks: 5,
        },
        {
          attemptAnswerId: "obj-1",
          marksAwarded: 5,
          maxMarks: 5,
        },
      ],
      subjectiveAnswerCount: 0,
      subjectiveMaxScore: 0,
    }),
  );

  assert.throws(() =>
    aggregateSubmissionResult({
      objectiveScores: [
        {
          attemptAnswerId: "shared-1",
          marksAwarded: 5,
          maxMarks: 5,
        },
      ],
      reviewedSubjectiveScores: [
        {
          attemptAnswerId: "shared-1",
          marksAwarded: 4,
          maxMarks: 5,
        },
      ],
      subjectiveAnswerCount: 1,
      subjectiveMaxScore: 5,
    }),
  );
});
