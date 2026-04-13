import assert from "node:assert/strict";
import test from "node:test";

import type { ReviewCompletionState } from "../utils/review-completion";
import {
  completeManualReviewAndRefreshReadiness,
  getPublicationGate,
  publishResultWithGate,
} from "../utils/review-completion";

const createBaseState = (): ReviewCompletionState => ({
  attemptId: "attempt-1",
  objectiveScores: [
    { attemptAnswerId: "obj-1", marksAwarded: 4, maxMarks: 5 },
    { attemptAnswerId: "obj-2", marksAwarded: 5, maxMarks: 5 },
  ],
  subjectiveAnswerCount: 2,
  subjectiveMaxScore: 10,
  reviewedSubjectiveScores: [],
  resultStatus: "PENDING_REVIEW",
  attemptStatus: "UNDER_REVIEW",
});

test("completed reviews update result readiness when all subjective answers are reviewed", () => {
  const firstReview = completeManualReviewAndRefreshReadiness(createBaseState(), {
    attemptAnswerId: "sub-1",
    marksAwarded: 3,
    maxMarks: 5,
  });

  assert.equal(firstReview.state.resultStatus, "PENDING_REVIEW");
  assert.equal(firstReview.state.attemptStatus, "UNDER_REVIEW");
  assert.equal(firstReview.readinessChanged, false);

  const secondReview = completeManualReviewAndRefreshReadiness(firstReview.state, {
    attemptAnswerId: "sub-2",
    marksAwarded: 4,
    maxMarks: 5,
  });

  assert.equal(secondReview.state.resultStatus, "READY");
  assert.equal(secondReview.state.attemptStatus, "EVALUATED");
  assert.equal(secondReview.readinessChanged, true);
});

test("publication stays blocked while required reviews are unfinished", () => {
  const incompleteState = completeManualReviewAndRefreshReadiness(createBaseState(), {
    attemptAnswerId: "sub-1",
    marksAwarded: 3,
    maxMarks: 5,
  }).state;

  const gate = getPublicationGate(incompleteState);

  assert.equal(gate.canPublish, false);
  assert.equal(
    gate.reason,
    "All required subjective reviews must be completed before publication.",
  );

  assert.throws(() => publishResultWithGate(incompleteState));
});

test("repeated review actions are idempotent and do not corrupt state", () => {
  const afterFirst = completeManualReviewAndRefreshReadiness(createBaseState(), {
    attemptAnswerId: "sub-1",
    marksAwarded: 3,
    maxMarks: 5,
  }).state;

  const afterRepeat = completeManualReviewAndRefreshReadiness(afterFirst, {
    attemptAnswerId: "sub-1",
    marksAwarded: 3,
    maxMarks: 5,
  }).state;

  assert.equal(afterRepeat.reviewedSubjectiveScores.length, 1);
  assert.equal(afterRepeat.resultStatus, "PENDING_REVIEW");

  const afterScoreUpdate = completeManualReviewAndRefreshReadiness(afterRepeat, {
    attemptAnswerId: "sub-1",
    marksAwarded: 4,
    maxMarks: 5,
  }).state;

  assert.equal(afterScoreUpdate.reviewedSubjectiveScores.length, 1);
  assert.equal(afterScoreUpdate.reviewedSubjectiveScores[0]?.marksAwarded, 4);
  assert.equal(afterScoreUpdate.resultStatus, "PENDING_REVIEW");
});

test("publication succeeds only after readiness is met", () => {
  const stateWithAllReviews = completeManualReviewAndRefreshReadiness(
    completeManualReviewAndRefreshReadiness(createBaseState(), {
      attemptAnswerId: "sub-1",
      marksAwarded: 3,
      maxMarks: 5,
    }).state,
    {
      attemptAnswerId: "sub-2",
      marksAwarded: 4,
      maxMarks: 5,
    },
  ).state;

  const gate = getPublicationGate(stateWithAllReviews);
  assert.equal(gate.canPublish, true);
  assert.equal(gate.reason, null);

  const published = publishResultWithGate(stateWithAllReviews);

  assert.equal(published.resultStatus, "PUBLISHED");
  assert.equal(published.attemptStatus, "EVALUATED");

  const republishGate = getPublicationGate(published);
  assert.equal(republishGate.canPublish, false);
  assert.equal(republishGate.reason, "Result is already published.");
});
