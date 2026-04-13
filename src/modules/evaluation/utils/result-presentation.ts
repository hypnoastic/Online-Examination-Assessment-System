import type { ResultStatus } from "../domain/result-state";

export const RESULT_STATUS_LABELS: Record<ResultStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  READY: "Ready",
  PUBLISHED: "Published",
};

export const formatScoreLabel = (earned: number, possible: number): string =>
  `${earned}/${possible}`;

export const formatPercentageLabel = (percentage: number): string =>
  `${percentage.toFixed(2)}%`;
