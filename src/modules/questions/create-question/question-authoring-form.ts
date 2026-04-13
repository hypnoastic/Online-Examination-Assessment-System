import type {
  QuestionAuthoringDraft,
  QuestionAuthoringDraftFor,
  QuestionOptionDraft,
  QuestionType,
  SubjectiveQuestionType,
} from "../domain/question.types";
import {
  createEmptyQuestionDraft,
  isObjectiveQuestionDraft,
  isSubjectiveQuestionDraft,
  isSubjectiveQuestionType,
  QUESTION_TYPE_LABELS,
  safeParseQuestionDraft,
} from "../utils/question-authoring";
import type { QuestionAuthoringValues } from "../validation/question.schemas";
import {
  addObjectiveQuestionOption,
  countObjectiveCorrectOptions,
  removeObjectiveQuestionOption,
  updateObjectiveQuestionAnswerKey,
  updateObjectiveQuestionOptionText,
  type ObjectiveQuestionDraft,
} from "./objective-question-form";

export type QuestionFormDraft = QuestionAuthoringDraft;
export type QuestionFormValues = QuestionAuthoringValues;

type QuestionFieldKey =
  | "stem"
  | "difficulty"
  | "topicId"
  | "explanation"
  | "expectedAnswer"
  | "options";
type QuestionOptionFieldKey = "label" | "text" | "optionOrder";

export interface QuestionAuthoringFormErrors {
  summary: string[];
  form: string[];
  fields: Partial<Record<QuestionFieldKey, string[]>>;
  optionFields: Record<number, Partial<Record<QuestionOptionFieldKey, string[]>>>;
}

const QUESTION_FORM_FIELD_KEYS = new Set<QuestionFieldKey>([
  "stem",
  "difficulty",
  "topicId",
  "explanation",
  "expectedAnswer",
  "options",
]);

const QUESTION_OPTION_FIELD_KEYS = new Set<QuestionOptionFieldKey>([
  "label",
  "text",
  "optionOrder",
]);

export const QUESTION_AUTHORING_RULES: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Choose exactly one correct answer.",
  MULTIPLE_CHOICE: "Choose at least two correct answers.",
  TRUE_FALSE:
    "Keep the fixed True and False options and choose one correct answer.",
  SHORT_TEXT:
    "Provide a concise reviewer reference answer for short written responses.",
  LONG_TEXT:
    "Provide a fuller model answer or rubric guidance for longer responses.",
};

const pushUniqueMessage = (messages: string[], message: string) => {
  if (!messages.includes(message)) {
    messages.push(message);
  }
};

export const createEmptyQuestionAuthoringFormErrors =
  (): QuestionAuthoringFormErrors => ({
    summary: [],
    form: [],
    fields: {},
    optionFields: {},
  });

export const createQuestionAuthoringDraft = <T extends QuestionType>(
  type: T,
  previousDraft?: Partial<QuestionFormDraft>,
): QuestionAuthoringDraftFor<T> => {
  if (previousDraft?.type === type) {
    return structuredClone(previousDraft) as QuestionAuthoringDraftFor<T>;
  }

  const nextDraft = createEmptyQuestionDraft(type);
  const sharedDraft = {
    ...nextDraft,
    stem: previousDraft?.stem ?? nextDraft.stem,
    difficulty: previousDraft?.difficulty ?? nextDraft.difficulty,
    topicId: previousDraft?.topicId ?? nextDraft.topicId,
    explanation: previousDraft?.explanation ?? nextDraft.explanation,
  };

  if (
    isSubjectiveQuestionType(type) &&
    previousDraft?.type &&
    isSubjectiveQuestionType(previousDraft.type)
  ) {
    return {
      ...sharedDraft,
      expectedAnswer:
        (previousDraft as QuestionAuthoringDraftFor<SubjectiveQuestionType>)
          .expectedAnswer ?? "",
    } as QuestionAuthoringDraftFor<T>;
  }

  return sharedDraft as QuestionAuthoringDraftFor<T>;
};

export const updateQuestionDraftTextField = (
  draft: QuestionFormDraft,
  field: "stem" | "explanation",
  value: string,
): QuestionFormDraft => ({
  ...draft,
  [field]: value,
});

export const updateQuestionDraftTopic = (
  draft: QuestionFormDraft,
  topicId: string,
): QuestionFormDraft => ({
  ...draft,
  topicId,
});

export const updateQuestionDraftDifficulty = (
  draft: QuestionFormDraft,
  difficulty: QuestionFormDraft["difficulty"],
): QuestionFormDraft => ({
  ...draft,
  difficulty,
});

export const updateQuestionDraftExpectedAnswer = (
  draft: QuestionFormDraft,
  expectedAnswer: string,
): QuestionFormDraft => {
  if (!isSubjectiveQuestionDraft(draft)) {
    return draft;
  }

  return {
    ...draft,
    expectedAnswer,
  };
};

export const addQuestionDraftOption = (draft: QuestionFormDraft) =>
  isObjectiveQuestionDraft(draft)
    ? addObjectiveQuestionOption(draft as ObjectiveQuestionDraft)
    : draft;

export const removeQuestionDraftOption = (
  draft: QuestionFormDraft,
  index: number,
) =>
  isObjectiveQuestionDraft(draft)
    ? removeObjectiveQuestionOption(draft as ObjectiveQuestionDraft, index)
    : draft;

export const updateQuestionDraftOptionText = (
  draft: QuestionFormDraft,
  index: number,
  text: string,
) =>
  isObjectiveQuestionDraft(draft)
    ? updateObjectiveQuestionOptionText(
        draft as ObjectiveQuestionDraft,
        index,
        text,
      )
    : draft;

export const updateQuestionDraftAnswerKey = (
  draft: QuestionFormDraft,
  index: number,
  checked: boolean,
) =>
  isObjectiveQuestionDraft(draft)
    ? updateObjectiveQuestionAnswerKey(
        draft as ObjectiveQuestionDraft,
        index,
        checked,
      )
    : draft;

export const countQuestionDraftCorrectAnswers = (draft: QuestionFormDraft) =>
  isObjectiveQuestionDraft(draft)
    ? countObjectiveCorrectOptions(draft as ObjectiveQuestionDraft)
    : 0;

export const mapQuestionAuthoringValidationErrors = (
  issues: Array<{ message: string; path: Array<PropertyKey> }>,
): QuestionAuthoringFormErrors => {
  const errors = createEmptyQuestionAuthoringFormErrors();

  issues.forEach((issue) => {
    pushUniqueMessage(errors.summary, issue.message);

    if (issue.path.length === 0) {
      pushUniqueMessage(errors.form, issue.message);
      return;
    }

    const [segment, maybeIndex, maybeField] = issue.path;

    if (segment === "options") {
      if (typeof maybeIndex === "number" && typeof maybeField === "string") {
        const optionFieldErrors = errors.optionFields[maybeIndex] ?? {};

        if (
          QUESTION_OPTION_FIELD_KEYS.has(maybeField as QuestionOptionFieldKey)
        ) {
          const fieldMessages =
            optionFieldErrors[maybeField as QuestionOptionFieldKey] ?? [];
          pushUniqueMessage(fieldMessages, issue.message);
          optionFieldErrors[maybeField as QuestionOptionFieldKey] =
            fieldMessages;
          errors.optionFields[maybeIndex] = optionFieldErrors;
        }

        return;
      }

      const optionMessages = errors.fields.options ?? [];
      pushUniqueMessage(optionMessages, issue.message);
      errors.fields.options = optionMessages;
      return;
    }

    if (
      typeof segment === "string" &&
      QUESTION_FORM_FIELD_KEYS.has(segment as QuestionFieldKey)
    ) {
      const fieldMessages = errors.fields[segment as QuestionFieldKey] ?? [];
      pushUniqueMessage(fieldMessages, issue.message);
      errors.fields[segment as QuestionFieldKey] = fieldMessages;
      return;
    }

    pushUniqueMessage(errors.form, issue.message);
  });

  return errors;
};

export const validateQuestionAuthoringDraft = (
  draft: QuestionFormDraft,
):
  | { success: true; data: QuestionFormValues }
  | { success: false; errors: QuestionAuthoringFormErrors } => {
  const parsed = safeParseQuestionDraft({
    ...draft,
    explanation: draft.explanation ?? "",
  });

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
    };
  }

  return {
    success: false,
    errors: mapQuestionAuthoringValidationErrors(parsed.error.issues),
  };
};

export const getQuestionAuthoringPreviewLines = (
  draft: QuestionFormDraft,
): Array<
  | { kind: "option"; label: string; text: string; isCorrect: boolean }
  | { kind: "answer"; text: string }
> => {
  if (isObjectiveQuestionDraft(draft)) {
    return draft.options.map((option: QuestionOptionDraft) => ({
      kind: "option" as const,
      label: option.label,
      text: option.text,
      isCorrect: option.isCorrect,
    }));
  }

  return [
    {
      kind: "answer" as const,
      text: draft.expectedAnswer,
    },
  ];
};

export const getQuestionTypeRule = (type: QuestionType) =>
  QUESTION_AUTHORING_RULES[type];

export const getQuestionTypeLabel = (type: QuestionType) =>
  QUESTION_TYPE_LABELS[type];
