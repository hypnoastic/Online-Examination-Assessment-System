import {
  DEFAULT_CHOICE_OPTION_COUNT,
  TRUE_FALSE_OPTION_LABELS,
  TRUE_FALSE_OPTION_TEXTS,
  type ObjectiveQuestionType,
  type QuestionAuthoringDraftFor,
  type QuestionOptionDraft,
  type QuestionType,
} from "../domain/question.types";
import {
  questionAuthoringSchema,
  questionSchemasByType,
  type QuestionAuthoringInput,
  type QuestionAuthoringValues,
} from "../validation/question.schemas";
export {
  isObjectiveQuestionDraft,
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_DIFFICULTY_OPTIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_OPTIONS,
  getQuestionReviewMode,
  isObjectiveQuestionType,
  isSubjectiveQuestionDraft,
  isSubjectiveQuestionType,
} from "./question-metadata";

const OPTION_LABEL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
