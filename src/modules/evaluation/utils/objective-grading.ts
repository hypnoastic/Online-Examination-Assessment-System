import type {
  EvaluatableAttemptAnswer,
  EvaluatableExamQuestion,
  EvaluationContext,
  EvaluationResult,
  EvaluationStrategy,
  EvaluationStrategyMap,
} from "../domain/evaluation.contracts";

const normalizeOptionIds = (optionIds?: string[]): string[] => {
  if (!optionIds || optionIds.length === 0) {
    return [];
  }

  return [...new Set(optionIds.map((value) => value.trim()).filter(Boolean))].sort();
};

const hasExactOptionSetMatch = (
  selectedOptionIds?: string[],
  expectedOptionIds?: string[],
): boolean => {
  const normalizedSelected = normalizeOptionIds(selectedOptionIds);
  const normalizedExpected = normalizeOptionIds(expectedOptionIds);

  if (normalizedSelected.length === 0 || normalizedExpected.length === 0) {
    return false;
  }

  if (normalizedSelected.length !== normalizedExpected.length) {
    return false;
  }

  return normalizedSelected.every(
    (selectedId, index) => selectedId === normalizedExpected[index],
  );
};

const createObjectiveResult = (
  question: EvaluatableExamQuestion,
  answer: EvaluatableAttemptAnswer,
  isCorrect: boolean,
): EvaluationResult => ({
  attemptAnswerId: answer.attemptAnswerId,
  examQuestionId: question.examQuestionId,
  marksAwarded: isCorrect ? question.maxMarks : 0,
  maxMarks: question.maxMarks,
  isCorrect,
  requiresManualReview: false,
});

export const singleChoiceEvaluationStrategy: EvaluationStrategy = {
  questionType: "SINGLE_CHOICE",
  evaluate: (question, answer) =>
    createObjectiveResult(
      question,
      answer,
      hasExactOptionSetMatch(answer.selectedOptionIds, question.expectedOptionIds),
    ),
};

export const multipleChoiceEvaluationStrategy: EvaluationStrategy = {
  questionType: "MULTIPLE_CHOICE",
  evaluate: (question, answer) =>
    createObjectiveResult(
      question,
      answer,
      hasExactOptionSetMatch(answer.selectedOptionIds, question.expectedOptionIds),
    ),
};

export const trueFalseEvaluationStrategy: EvaluationStrategy = {
  questionType: "TRUE_FALSE",
  evaluate: (question, answer) =>
    createObjectiveResult(
      question,
      answer,
      hasExactOptionSetMatch(answer.selectedOptionIds, question.expectedOptionIds),
    ),
};

export const OBJECTIVE_EVALUATION_STRATEGIES: EvaluationStrategyMap = {
  SINGLE_CHOICE: singleChoiceEvaluationStrategy,
  MULTIPLE_CHOICE: multipleChoiceEvaluationStrategy,
  TRUE_FALSE: trueFalseEvaluationStrategy,
};

export const evaluateObjectiveAnswerByStrategy = (
  question: EvaluatableExamQuestion,
  answer: EvaluatableAttemptAnswer,
  context: EvaluationContext,
): EvaluationResult => {
  const strategy = OBJECTIVE_EVALUATION_STRATEGIES[question.questionType];

  if (!strategy) {
    throw new Error(
      `No objective evaluation strategy registered for question type ${question.questionType}.`,
    );
  }

  return strategy.evaluate(question, answer, context);
};
