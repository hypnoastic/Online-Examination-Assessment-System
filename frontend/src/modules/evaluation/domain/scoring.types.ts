export interface ScoreWindow {
  earned: number;
  possible: number;
}

export interface ResultScoreBreakdown {
  objective: ScoreWindow;
  subjective: ScoreWindow;
  final: ScoreWindow;
  percentage: number;
}

export interface AggregateScoringInput {
  objectiveEarned: number;
  objectivePossible: number;
  subjectiveEarned?: number;
  subjectivePossible?: number;
}
