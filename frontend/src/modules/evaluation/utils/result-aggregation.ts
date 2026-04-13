import {
  resolveResultAndAttemptStates,
  type AttemptReviewStatus,
  type ResultStatus,
} from "../domain/result-state";
import type { ResultScoreBreakdown } from "../domain/scoring.types";
import { aggregateResultScores } from "./scoring";

export interface AggregatableAnswerScore {
  attemptAnswerId: string;
  marksAwarded: number;
  maxMarks: number;
}

export interface ResultAggregationInput {
  objectiveScores: AggregatableAnswerScore[];
  reviewedSubjectiveScores?: AggregatableAnswerScore[];
  subjectiveAnswerCount: number;
  subjectiveMaxScore: number;
}

export interface ResultAggregationOutput {
  scoreBreakdown: ResultScoreBreakdown;
  resultStatus: ResultStatus;
  attemptStatus: AttemptReviewStatus;
  reviewedSubjectiveCount: number;
  pendingSubjectiveCount: number;
}

const sumScoreField = (
  scores: AggregatableAnswerScore[],
  selector: (score: AggregatableAnswerScore) => number,
): number => scores.reduce((total, score) => total + Math.max(0, selector(score)), 0);

const assertUniqueAttemptAnswerIds = (
  scores: AggregatableAnswerScore[],
  bucketName: string,
): Set<string> => {
  const ids = new Set<string>();

  for (const score of scores) {
    const normalizedId = score.attemptAnswerId.trim();

    if (!normalizedId) {
      throw new Error(`${bucketName} contains an empty attemptAnswerId.`);
    }

    if (ids.has(normalizedId)) {
      throw new Error(
        `Duplicate attemptAnswerId ${normalizedId} in ${bucketName}. Double-counting is not allowed.`,
      );
    }

    ids.add(normalizedId);
  }

  return ids;
};

const assertNoOverlapBetweenScoreBuckets = (
  objectiveIds: Set<string>,
  subjectiveIds: Set<string>,
): void => {
  for (const subjectiveId of subjectiveIds) {
    if (objectiveIds.has(subjectiveId)) {
      throw new Error(
        `attemptAnswerId ${subjectiveId} appears in both objective and subjective score buckets.`,
      );
    }
  }
};

export const aggregateSubmissionResult = (
  input: ResultAggregationInput,
): ResultAggregationOutput => {
  const objectiveScores = input.objectiveScores;
  const reviewedSubjectiveScores = input.reviewedSubjectiveScores ?? [];

  if (input.subjectiveAnswerCount < 0) {
    throw new Error("subjectiveAnswerCount cannot be negative.");
  }

  if (input.subjectiveMaxScore < 0) {
    throw new Error("subjectiveMaxScore cannot be negative.");
  }

  const objectiveIds = assertUniqueAttemptAnswerIds(
    objectiveScores,
    "objectiveScores",
  );
  const reviewedSubjectiveIds = assertUniqueAttemptAnswerIds(
    reviewedSubjectiveScores,
    "reviewedSubjectiveScores",
  );
  assertNoOverlapBetweenScoreBuckets(objectiveIds, reviewedSubjectiveIds);

  const reviewedSubjectiveCount = reviewedSubjectiveScores.length;

  if (reviewedSubjectiveCount > input.subjectiveAnswerCount) {
    throw new Error(
      "reviewedSubjectiveScores cannot exceed subjectiveAnswerCount.",
    );
  }

  const pendingSubjectiveCount = input.subjectiveAnswerCount - reviewedSubjectiveCount;
  const hasPendingSubjectiveReviews = pendingSubjectiveCount > 0;

  const scoreBreakdown = aggregateResultScores({
    objectiveEarned: sumScoreField(objectiveScores, (score) => score.marksAwarded),
    objectivePossible: sumScoreField(objectiveScores, (score) => score.maxMarks),
    subjectiveEarned: sumScoreField(
      reviewedSubjectiveScores,
      (score) => score.marksAwarded,
    ),
    subjectivePossible: input.subjectiveMaxScore,
  });

  const { resultStatus, attemptStatus } = resolveResultAndAttemptStates(
    hasPendingSubjectiveReviews,
  );

  return {
    scoreBreakdown,
    resultStatus,
    attemptStatus,
    reviewedSubjectiveCount,
    pendingSubjectiveCount,
  };
};
