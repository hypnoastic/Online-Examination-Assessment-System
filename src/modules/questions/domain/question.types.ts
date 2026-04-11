export const QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_TEXT",
  "LONG_TEXT",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const OBJECTIVE_QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
] as const;

export type ObjectiveQuestionType = (typeof OBJECTIVE_QUESTION_TYPES)[number];

export const SUBJECTIVE_QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
] as const;

export type SubjectiveQuestionType = (typeof SUBJECTIVE_QUESTION_TYPES)[number];

export const QUESTION_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_REVIEW_MODES = ["OBJECTIVE", "MANUAL"] as const;

export type QuestionReviewMode = (typeof QUESTION_REVIEW_MODES)[number];

export const DEFAULT_CHOICE_OPTION_COUNT = 4;
export const TRUE_FALSE_OPTION_LABELS = ["A", "B"] as const;
export const TRUE_FALSE_OPTION_TEXTS = ["True", "False"] as const;

export interface QuestionTopicShape {
  id: string;
  name: string;
  description?: string | null;
}

export interface QuestionOptionDraft {
  id?: string;
  label: string;
  text: string;
  isCorrect: boolean;
  optionOrder: number;
}

export interface BaseQuestionAuthoringDraft {
  type: QuestionType;
  stem: string;
  difficulty: QuestionDifficulty;
  topicId: string;
  explanation?: string;
}

export interface SingleChoiceQuestionDraft
  extends BaseQuestionAuthoringDraft {
  type: "SINGLE_CHOICE";
  options: QuestionOptionDraft[];
}

export interface MultipleChoiceQuestionDraft
  extends BaseQuestionAuthoringDraft {
  type: "MULTIPLE_CHOICE";
  options: QuestionOptionDraft[];
}

export interface TrueFalseQuestionDraft extends BaseQuestionAuthoringDraft {
  type: "TRUE_FALSE";
  options: QuestionOptionDraft[];
}

export interface ShortTextQuestionDraft extends BaseQuestionAuthoringDraft {
  type: "SHORT_TEXT";
  expectedAnswer: string;
}

export interface LongTextQuestionDraft extends BaseQuestionAuthoringDraft {
  type: "LONG_TEXT";
  expectedAnswer: string;
}

export type QuestionAuthoringDraft =
  | SingleChoiceQuestionDraft
  | MultipleChoiceQuestionDraft
  | TrueFalseQuestionDraft
  | ShortTextQuestionDraft
  | LongTextQuestionDraft;

export interface QuestionAuthoringDraftMap {
  SINGLE_CHOICE: SingleChoiceQuestionDraft;
  MULTIPLE_CHOICE: MultipleChoiceQuestionDraft;
  TRUE_FALSE: TrueFalseQuestionDraft;
  SHORT_TEXT: ShortTextQuestionDraft;
  LONG_TEXT: LongTextQuestionDraft;
}

export type QuestionAuthoringDraftFor<T extends QuestionType> =
  QuestionAuthoringDraftMap[T];
