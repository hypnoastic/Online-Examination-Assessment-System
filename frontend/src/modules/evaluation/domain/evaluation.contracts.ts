import type { QuestionType } from "../../questions/domain/question.types";

export interface EvaluationContext {
  attemptId: string;
  examId: string;
  studentId: string;
  evaluatedAt: Date;
}

export interface EvaluatableExamQuestion {
  examQuestionId: string;
  questionType: QuestionType;
  maxMarks: number;
  expectedAnswerText?: string | null;
  expectedOptionIds?: string[];
}

export interface EvaluatableAttemptAnswer {
  attemptAnswerId: string;
  examQuestionId: string;
  responseText?: string | null;
  selectedOptionIds?: string[];
}

export interface EvaluationResult {
  attemptAnswerId: string;
  examQuestionId: string;
  marksAwarded: number;
  maxMarks: number;
  isCorrect?: boolean;
  requiresManualReview: boolean;
  feedback?: string;
}

export interface EvaluationStrategy {
  readonly questionType: QuestionType;
  evaluate(
    question: EvaluatableExamQuestion,
    answer: EvaluatableAttemptAnswer,
    context: EvaluationContext,
  ): EvaluationResult;
}

export type EvaluationStrategyMap = Partial<Record<QuestionType, EvaluationStrategy>>;

export interface ObjectiveGradingSummary {
  objectiveScore: number;
  objectiveMaxScore: number;
  evaluatedAnswersCount: number;
  requiresManualReviewCount: number;
}

export interface ObjectiveEvaluationService {
  runObjectiveGrading(attemptId: string): Promise<ObjectiveGradingSummary>;
}

export interface ManualReviewPayload {
  attemptAnswerId: string;
  reviewerId: string;
  marksAwarded: number;
  feedback?: string;
}

export interface ManualReviewService {
  reviewAnswer(payload: ManualReviewPayload): Promise<void>;
}
