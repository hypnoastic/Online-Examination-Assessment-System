import type {
  AggregateScoringInput,
  ResultScoreBreakdown,
  ScoreWindow,
} from "../domain/scoring.types";

const normalizeScoreWindow = (earned: number, possible: number): ScoreWindow => ({
  earned: Math.max(0, earned),
  possible: Math.max(0, possible),
});

export const calculatePercentage = (earned: number, possible: number): number => {
  if (possible <= 0) {
    return 0;
  }

  return Number(((earned / possible) * 100).toFixed(2));
};

export const aggregateResultScores = (
  input: AggregateScoringInput,
): ResultScoreBreakdown => {
  const objective = normalizeScoreWindow(
    input.objectiveEarned,
    input.objectivePossible,
  );
  const subjective = normalizeScoreWindow(
    input.subjectiveEarned ?? 0,
    input.subjectivePossible ?? 0,
  );

  const final = normalizeScoreWindow(
    objective.earned + subjective.earned,
    objective.possible + subjective.possible,
  );

  return {
    objective,
    subjective,
    final,
    percentage: calculatePercentage(final.earned, final.possible),
  };
};
