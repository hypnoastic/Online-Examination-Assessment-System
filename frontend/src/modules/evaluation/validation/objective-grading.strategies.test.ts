import assert from "node:assert/strict";
import test from "node:test";

import type {
  EvaluatableAttemptAnswer,
  EvaluatableExamQuestion,
  EvaluationContext,
} from "../domain/evaluation.contracts";
import {
  evaluateObjectiveAnswerByStrategy,
  multipleChoiceEvaluationStrategy,
  singleChoiceEvaluationStrategy,
  trueFalseEvaluationStrategy,
} from "../utils/objective-grading";

const baseContext: EvaluationContext = {
  attemptId: "attempt-1",
  examId: "exam-1",
  studentId: "student-1",
  evaluatedAt: new Date("2026-04-12T10:00:00.000Z"),
};

const createQuestion = (
  questionType: EvaluatableExamQuestion["questionType"],
  expectedOptionIds: string[],
): EvaluatableExamQuestion => ({
  examQuestionId: `exam-question-${questionType.toLowerCase()}`,
  questionType,
  maxMarks: 5,
  expectedOptionIds,
});

const createAnswer = (selectedOptionIds?: string[]): EvaluatableAttemptAnswer => ({
  attemptAnswerId: "attempt-answer-1",
  examQuestionId: "exam-question-1",
  selectedOptionIds,
});

test("single choice gives full marks only for the exact correct option", () => {
  const question = createQuestion("SINGLE_CHOICE", ["option-b"]);

  const correct = singleChoiceEvaluationStrategy.evaluate(
    question,
    createAnswer(["option-b"]),
    baseContext,
  );
  const wrong = singleChoiceEvaluationStrategy.evaluate(
    question,
    createAnswer(["option-a"]),
    baseContext,
  );
  const unanswered = singleChoiceEvaluationStrategy.evaluate(
    question,
    createAnswer(),
    baseContext,
  );

  assert.equal(correct.marksAwarded, 5);
  assert.equal(correct.isCorrect, true);
  assert.equal(wrong.marksAwarded, 0);
  assert.equal(wrong.isCorrect, false);
  assert.equal(unanswered.marksAwarded, 0);
  assert.equal(unanswered.isCorrect, false);
  assert.equal(unanswered.requiresManualReview, false);
});

test("multiple choice scoring is order-independent and deterministic", () => {
  const question = createQuestion("MULTIPLE_CHOICE", ["option-a", "option-c"]);
  const answer = createAnswer(["option-c", "option-a", "option-a"]);

  const firstRun = multipleChoiceEvaluationStrategy.evaluate(
    question,
    answer,
    baseContext,
  );
  const secondRun = multipleChoiceEvaluationStrategy.evaluate(
    question,
    answer,
    baseContext,
  );

  assert.equal(firstRun.marksAwarded, 5);
  assert.equal(firstRun.isCorrect, true);
  assert.deepEqual(firstRun, secondRun);

  const incomplete = multipleChoiceEvaluationStrategy.evaluate(
    question,
    createAnswer(["option-a"]),
    baseContext,
  );
  assert.equal(incomplete.marksAwarded, 0);
  assert.equal(incomplete.isCorrect, false);
});

test("true-false uses the same exact-option objective contract", () => {
  const question = createQuestion("TRUE_FALSE", ["option-true"]);

  const correct = trueFalseEvaluationStrategy.evaluate(
    question,
    createAnswer(["option-true"]),
    baseContext,
  );
  const wrong = trueFalseEvaluationStrategy.evaluate(
    question,
    createAnswer(["option-false"]),
    baseContext,
  );

  assert.equal(correct.marksAwarded, 5);
  assert.equal(wrong.marksAwarded, 0);
});

test("strategy lookup evaluates supported objective question types", () => {
  const result = evaluateObjectiveAnswerByStrategy(
    createQuestion("SINGLE_CHOICE", ["option-z"]),
    createAnswer(["option-z"]),
    baseContext,
  );

  assert.equal(result.marksAwarded, 5);
  assert.equal(result.requiresManualReview, false);
});

test("strategy lookup throws for unsupported question types", () => {
  assert.throws(() =>
    evaluateObjectiveAnswerByStrategy(
      createQuestion("SHORT_TEXT", []),
      createAnswer(["anything"]),
      baseContext,
    ),
  );
});
