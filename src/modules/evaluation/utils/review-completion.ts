import {
  canPublishResult,
  transitionResultStatus,
  type AttemptReviewStatus,
  type ResultStatus,
} from "../domain/result-state";
import {
  aggregateSubmissionResult,
  type AggregatableAnswerScore,
} from "./result-aggregation";

export interface ReviewCompletionState {
  attemptId: string;
  objectiveScores: AggregatableAnswerScore[];
  subjectiveAnswerCount: number;
  subjectiveMaxScore: number;
  reviewedSubjectiveScores: AggregatableAnswerScore[];
  resultStatus: ResultStatus;
  attemptStatus: AttemptReviewStatus;
}

export interface ReviewCompletionResult {
  state: ReviewCompletionState;
  readinessChanged: boolean;
}

export interface PublicationGate {
  canPublish: boolean;
  reason: string | null;
}

const sortScoresByAnswerId = (
  scores: AggregatableAnswerScore[],
): AggregatableAnswerScore[] =>
  [...scores].sort((left, right) =>
    left.attemptAnswerId.localeCompare(right.attemptAnswerId),
  );

const buildUpsertedSubjectiveScores = (
  existing: AggregatableAnswerScore[],
  incoming: AggregatableAnswerScore,
): AggregatableAnswerScore[] => {
  const normalizedId = incoming.attemptAnswerId.trim();

  if (!normalizedId) {
    throw new Error("attemptAnswerId is required for manual review completion.");
  }

  const deduped = new Map<string, AggregatableAnswerScore>();

  for (const score of existing) {
    deduped.set(score.attemptAnswerId, score);
  }

  deduped.set(normalizedId, {
    ...incoming,
    attemptAnswerId: normalizedId,
  });

  return sortScoresByAnswerId(Array.from(deduped.values()));
};

const rebuildStateWithAggregation = (
  state: ReviewCompletionState,
  reviewedSubjectiveScores: AggregatableAnswerScore[],
): ReviewCompletionState => {
  const aggregated = aggregateSubmissionResult({
    objectiveScores: state.objectiveScores,
    reviewedSubjectiveScores,
    subjectiveAnswerCount: state.subjectiveAnswerCount,
    subjectiveMaxScore: state.subjectiveMaxScore,
  });

  return {
    ...state,
    reviewedSubjectiveScores,
    resultStatus: aggregated.resultStatus,
    attemptStatus: aggregated.attemptStatus,
  };
};

export const completeManualReviewAndRefreshReadiness = (
  state: ReviewCompletionState,
  manualReviewScore: AggregatableAnswerScore,
): ReviewCompletionResult => {
  const nextReviewedSubjectiveScores = buildUpsertedSubjectiveScores(
    state.reviewedSubjectiveScores,
    manualReviewScore,
  );

  const previousStatus = state.resultStatus;
  const nextState = rebuildStateWithAggregation(state, nextReviewedSubjectiveScores);

  return {
    state: nextState,
    readinessChanged: previousStatus !== nextState.resultStatus,
  };
};

export const getPublicationGate = (
  state: Pick<ReviewCompletionState, "resultStatus">,
): PublicationGate => {
  if (state.resultStatus === "PUBLISHED") {
    return {
      canPublish: false,
      reason: "Result is already published.",
    };
  }

  if (!canPublishResult(state.resultStatus)) {
    return {
      canPublish: false,
      reason: "All required subjective reviews must be completed before publication.",
    };
  }

  return {
    canPublish: true,
    reason: null,
  };
};

export const publishResultWithGate = (
  state: ReviewCompletionState,
): ReviewCompletionState => {
  const gate = getPublicationGate(state);

  if (!gate.canPublish) {
    throw new Error(gate.reason ?? "Result publication is blocked.");
  }

  return {
    ...state,
    resultStatus: transitionResultStatus(state.resultStatus, "PUBLISHED"),
    attemptStatus: "EVALUATED",
  };
};
