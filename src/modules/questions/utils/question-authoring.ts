import {
  DEFAULT_CHOICE_OPTION_COUNT,
  OBJECTIVE_QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
  SUBJECTIVE_QUESTION_TYPES,
  TRUE_FALSE_OPTION_LABELS,
  TRUE_FALSE_OPTION_TEXTS,
  type ObjectiveQuestionType,
  type QuestionAuthoringDraftFor,
  type QuestionDifficulty,
  type QuestionOptionDraft,
  type QuestionReviewMode,
  type QuestionType,
  type SubjectiveQuestionType,
} from "../domain/question.types";
import {
  questionAuthoringSchema,
  questionSchemasByType,
  type QuestionAuthoringInput,
  type QuestionAuthoringValues,
} from "../validation/question.schemas";

const OPTION_LABEL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

export const getQuestionSchemaForType = <T extends QuestionType>(type: T) =>
  questionSchemasByType[type];

export const createChoiceOptionDraft = (
  index: number,
  overrides: Partial<QuestionOptionDraft> = {},
): QuestionOptionDraft => ({
  label:
    OPTION_LABEL_ALPHABET[index] ?? `OPTION_${String(index + 1).padStart(2, "0")}`,
  text: "",
  isCorrect: false,
  optionOrder: index + 1,
  ...overrides,
});

export const createTrueFalseOptionDrafts = (
  correctAnswer?: boolean,
): QuestionOptionDraft[] =>
  TRUE_FALSE_OPTION_TEXTS.map((text, index) => {
    const isTrueOption = index === 0;
    const isCorrect =
      correctAnswer === undefined ? false : correctAnswer === isTrueOption;

    return createChoiceOptionDraft(index, {
      label: TRUE_FALSE_OPTION_LABELS[index],
      text,
      isCorrect,
      optionOrder: index + 1,
    });
  });

export const createDefaultOptions = (
  type: ObjectiveQuestionType,
): QuestionOptionDraft[] => {
  if (type === "TRUE_FALSE") {
    return createTrueFalseOptionDrafts();
  }

  return Array.from({ length: DEFAULT_CHOICE_OPTION_COUNT }, (_, index) =>
    createChoiceOptionDraft(index),
  );
};

export const createEmptyQuestionDraft = <T extends QuestionType>(
  type: T,
): QuestionAuthoringDraftFor<T> => {
  const baseDraft = {
    type,
    stem: "",
    difficulty: "MEDIUM" as const,
    topicId: "",
    explanation: "",
  };

  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return {
        ...baseDraft,
        type,
        options: createDefaultOptions(type),
      } as QuestionAuthoringDraftFor<T>;
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return {
        ...baseDraft,
        type,
        expectedAnswer: "",
      } as QuestionAuthoringDraftFor<T>;
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unsupported question type: ${String(exhaustiveCheck)}`);
    }
  }
};

export const normalizeQuestionDraftInput = (
  input: QuestionAuthoringInput,
): QuestionAuthoringInput => {
  if (!("options" in input) || !Array.isArray(input.options)) {
    return input;
  }

  return {
    ...input,
    options: [...input.options].sort(
      (left, right) => Number(left.optionOrder) - Number(right.optionOrder),
    ),
  };
};

export const parseQuestionDraft = (
  input: QuestionAuthoringInput,
): QuestionAuthoringValues =>
  questionAuthoringSchema.parse(normalizeQuestionDraftInput(input));

export const safeParseQuestionDraft = (
  input: QuestionAuthoringInput,
) => questionAuthoringSchema.safeParse(normalizeQuestionDraftInput(input));
