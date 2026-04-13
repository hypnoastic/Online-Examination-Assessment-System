import assert from "node:assert/strict";
import test from "node:test";

import { QUESTION_TYPES } from "../../questions/domain/question.types";
import {
  RESULT_STATUSES,
  canPublishResult,
  canTransitionResultStatus,
  getNextResultStatuses,
  isStudentVisibleResultStatus,
  resolveResultStatusAfterObjectiveGrading,
  transitionResultStatus,
} from "../domain/result-state";
import { aggregateResultScores, calculatePercentage } from "../utils/scoring";

test("evaluation contracts stay aligned with supported question types", () => {
  assert.deepEqual(QUESTION_TYPES, [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "SHORT_TEXT",
    "LONG_TEXT",
  ]);
});

test("result statuses match spec-defined lifecycle", () => {
  assert.deepEqual(RESULT_STATUSES, ["PENDING_REVIEW", "READY", "PUBLISHED"]);
});

test("result transitions enforce publish gating", () => {
  assert.equal(canTransitionResultStatus("PENDING_REVIEW", "READY"), true);
  assert.equal(canTransitionResultStatus("READY", "PUBLISHED"), true);
  assert.equal(canTransitionResultStatus("PENDING_REVIEW", "PUBLISHED"), false);
  assert.equal(canPublishResult("PENDING_REVIEW"), false);
  assert.equal(canPublishResult("READY"), true);
  assert.equal(isStudentVisibleResultStatus("READY"), false);
  assert.equal(isStudentVisibleResultStatus("PUBLISHED"), true);

  assert.deepEqual(getNextResultStatuses("PENDING_REVIEW"), ["READY"]);
  assert.equal(transitionResultStatus("READY", "PUBLISHED"), "PUBLISHED");

  assert.throws(() => transitionResultStatus("PENDING_REVIEW", "PUBLISHED"));
});

test("post-objective status helper reflects review requirements", () => {
  assert.equal(resolveResultStatusAfterObjectiveGrading(true), "PENDING_REVIEW");
  assert.equal(resolveResultStatusAfterObjectiveGrading(false), "READY");
});

test("scoring helpers aggregate and normalize score boundaries", () => {
  assert.equal(calculatePercentage(18, 24), 75);
  assert.equal(calculatePercentage(10, 0), 0);

  const breakdown = aggregateResultScores({
    objectiveEarned: 32,
    objectivePossible: 40,
    subjectiveEarned: 8,
    subjectivePossible: 10,
  });

  assert.deepEqual(breakdown, {
    objective: { earned: 32, possible: 40 },
    subjective: { earned: 8, possible: 10 },
    final: { earned: 40, possible: 50 },
    percentage: 80,
  });
});
