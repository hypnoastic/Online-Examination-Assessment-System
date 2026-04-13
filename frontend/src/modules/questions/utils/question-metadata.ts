import {
  OBJECTIVE_QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
  SUBJECTIVE_QUESTION_TYPES,
  type ObjectiveQuestionAuthoringDraft,
  type ObjectiveQuestionType,
  type QuestionAuthoringDraft,
  type QuestionDifficulty,
  type QuestionReviewMode,
  type QuestionType,
  type SubjectiveQuestionAuthoringDraft,
  type SubjectiveQuestionType,
} from "../domain/question.types";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  SHORT_TEXT: "Short Text",
  LONG_TEXT: "Long Text",
};

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const QUESTION_REVIEW_MODE_BY_TYPE: Record<QuestionType, QuestionReviewMode> = {
  SINGLE_CHOICE: "OBJECTIVE",
  MULTIPLE_CHOICE: "OBJECTIVE",
  TRUE_FALSE: "OBJECTIVE",
  SHORT_TEXT: "MANUAL",
  LONG_TEXT: "MANUAL",
};

export const QUESTION_TYPE_OPTIONS = QUESTION_TYPES.map((value) => ({
  value,
  label: QUESTION_TYPE_LABELS[value],
}));

export const QUESTION_DIFFICULTY_OPTIONS = QUESTION_DIFFICULTIES.map(
  (value) => ({
    value,
    label: QUESTION_DIFFICULTY_LABELS[value],
  }),
);

export const getQuestionReviewMode = (
  type: QuestionType,
): QuestionReviewMode => QUESTION_REVIEW_MODE_BY_TYPE[type];

export const isObjectiveQuestionType = (
  type: QuestionType,
): type is ObjectiveQuestionType =>
  OBJECTIVE_QUESTION_TYPES.includes(type as ObjectiveQuestionType);

export const isSubjectiveQuestionType = (
  type: QuestionType,
): type is SubjectiveQuestionType =>
  SUBJECTIVE_QUESTION_TYPES.includes(type as SubjectiveQuestionType);

export const isObjectiveQuestionDraft = (
  draft: QuestionAuthoringDraft,
): draft is ObjectiveQuestionAuthoringDraft => isObjectiveQuestionType(draft.type);

export const isSubjectiveQuestionDraft = (
  draft: QuestionAuthoringDraft,
): draft is SubjectiveQuestionAuthoringDraft => isSubjectiveQuestionType(draft.type);
