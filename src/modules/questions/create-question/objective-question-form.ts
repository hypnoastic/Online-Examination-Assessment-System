import {
  OBJECTIVE_QUESTION_TYPES,
  type ObjectiveQuestionType,
  type QuestionAuthoringDraftFor,
  type QuestionOptionDraft,
} from "../domain/question.types.js";
import {
  createChoiceOptionDraft,
  createEmptyQuestionDraft,
  safeParseQuestionDraft,
} from "../utils/question-authoring.js";
import { QUESTION_TYPE_LABELS } from "../utils/question-metadata.js";
import type { QuestionAuthoringValues } from "../validation/question.schemas.js";

export type ObjectiveQuestionDraft =
  QuestionAuthoringDraftFor<ObjectiveQuestionType>;

export type ObjectiveQuestionValues = Extract<
  QuestionAuthoringValues,
  { type: ObjectiveQuestionType }
>;

export const DEFAULT_OBJECTIVE_QUESTION_TYPE = "SINGLE_CHOICE" as const;

export const OBJECTIVE_QUESTION_TYPE_OPTIONS = OBJECTIVE_QUESTION_TYPES.map(
  (value) => ({
    value,
    label: QUESTION_TYPE_LABELS[value],
  }),
);

export const OBJECTIVE_QUESTION_RULES: Record<ObjectiveQuestionType, string> = {
  SINGLE_CHOICE: "Choose exactly one correct answer.",
  MULTIPLE_CHOICE: "Choose at least two correct answers.",
  TRUE_FALSE: "Keep the fixed True and False options and choose one correct answer.",
};

type ObjectiveFieldKey = "stem" | "difficulty" | "topicId" | "explanation" | "options";
type ObjectiveOptionFieldKey = "label" | "text" | "optionOrder";

export interface ObjectiveQuestionFormErrors {
  summary: string[];
  form: string[];
  fields: Partial<Record<ObjectiveFieldKey, string[]>>;
  optionFields: Record<number, Partial<Record<ObjectiveOptionFieldKey, string[]>>>;
}

const OBJECTIVE_FORM_FIELD_KEYS = new Set<ObjectiveFieldKey>([
  "stem",
  "difficulty",
  "topicId",
  "explanation",
  "options",
]);

const OBJECTIVE_OPTION_FIELD_KEYS = new Set<ObjectiveOptionFieldKey>([
  "label",
  "text",
  "optionOrder",
]);

const pushUniqueMessage = (messages: string[], message: string) => {
  if (!messages.includes(message)) {
    messages.push(message);
  }
};

export const createEmptyObjectiveQuestionFormErrors =
  (): ObjectiveQuestionFormErrors => ({
    summary: [],
    form: [],
    fields: {},
    optionFields: {},
  });

const reindexObjectiveOptions = (options: QuestionOptionDraft[]) =>
  options.map((option, index) => ({
    ...option,
    label: createChoiceOptionDraft(index).label,
    optionOrder: index + 1,
  }));

export const createObjectiveQuestionDraft = (
  type: ObjectiveQuestionType,
  previousDraft?: Partial<ObjectiveQuestionDraft>,
): ObjectiveQuestionDraft => {
  const nextDraft = createEmptyQuestionDraft(type) as ObjectiveQuestionDraft;

  return {
    ...nextDraft,
    stem: previousDraft?.stem ?? nextDraft.stem,
    difficulty: previousDraft?.difficulty ?? nextDraft.difficulty,
    topicId: previousDraft?.topicId ?? nextDraft.topicId,
    explanation: previousDraft?.explanation ?? nextDraft.explanation,
  };
};

export const countObjectiveCorrectOptions = (draft: ObjectiveQuestionDraft) =>
  draft.options.filter((option) => option.isCorrect).length;

export const addObjectiveQuestionOption = (
  draft: ObjectiveQuestionDraft,
): ObjectiveQuestionDraft => {
  if (draft.type === "TRUE_FALSE" || draft.options.length >= 6) {
    return draft;
  }

  return {
    ...draft,
    options: reindexObjectiveOptions([
      ...draft.options,
      createChoiceOptionDraft(draft.options.length),
    ]),
  };
};

export const removeObjectiveQuestionOption = (
  draft: ObjectiveQuestionDraft,
  index: number,
): ObjectiveQuestionDraft => {
  if (draft.type === "TRUE_FALSE" || draft.options.length <= 2) {
    return draft;
  }

  return {
    ...draft,
    options: reindexObjectiveOptions(
      draft.options.filter((_, optionIndex) => optionIndex !== index),
    ),
  };
};

export const updateObjectiveQuestionOptionText = (
  draft: ObjectiveQuestionDraft,
  index: number,
  text: string,
): ObjectiveQuestionDraft => {
  if (draft.type === "TRUE_FALSE") {
    return draft;
  }

  return {
    ...draft,
    options: draft.options.map((option, optionIndex) =>
      optionIndex === index ? { ...option, text } : option,
    ),
  };
};

export const updateObjectiveQuestionAnswerKey = (
  draft: ObjectiveQuestionDraft,
  index: number,
  checked: boolean,
): ObjectiveQuestionDraft => {
  if (draft.type === "MULTIPLE_CHOICE") {
    return {
      ...draft,
      options: draft.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, isCorrect: checked } : option,
      ),
    };
  }

  return {
    ...draft,
    options: draft.options.map((option, optionIndex) => ({
      ...option,
      isCorrect: checked && optionIndex === index,
    })),
  };
};

export const mapObjectiveQuestionValidationErrors = (
  draft: ObjectiveQuestionDraft,
  issues: Array<{ message: string; path: Array<PropertyKey> }>,
): ObjectiveQuestionFormErrors => {
  const errors = createEmptyObjectiveQuestionFormErrors();

  issues.forEach((issue) => {
    pushUniqueMessage(errors.summary, issue.message);

    if (issue.path.length === 0) {
      pushUniqueMessage(errors.form, issue.message);

      if (draft.type === "TRUE_FALSE") {
        const fieldMessages = errors.fields.options ?? [];
        pushUniqueMessage(fieldMessages, issue.message);
        errors.fields.options = fieldMessages;
      }

      return;
    }

    const [segment, maybeIndex, maybeField] = issue.path;

    if (segment === "options") {
      if (typeof maybeIndex === "number" && typeof maybeField === "string") {
        const optionFieldErrors = errors.optionFields[maybeIndex] ?? {};

        if (
          OBJECTIVE_OPTION_FIELD_KEYS.has(maybeField as ObjectiveOptionFieldKey)
        ) {
          const messages =
            optionFieldErrors[maybeField as ObjectiveOptionFieldKey] ?? [];
          pushUniqueMessage(messages, issue.message);
          optionFieldErrors[maybeField as ObjectiveOptionFieldKey] = messages;
          errors.optionFields[maybeIndex] = optionFieldErrors;
        }

        return;
      }

      const fieldMessages = errors.fields.options ?? [];
      pushUniqueMessage(fieldMessages, issue.message);
      errors.fields.options = fieldMessages;
      return;
    }

    if (
      typeof segment === "string" &&
      OBJECTIVE_FORM_FIELD_KEYS.has(segment as ObjectiveFieldKey)
    ) {
      const fieldMessages = errors.fields[segment as ObjectiveFieldKey] ?? [];
      pushUniqueMessage(fieldMessages, issue.message);
      errors.fields[segment as ObjectiveFieldKey] = fieldMessages;
      return;
    }

    pushUniqueMessage(errors.form, issue.message);
  });

  return errors;
};

export const getObjectiveQuestionErrorSummary = (
  errors: ObjectiveQuestionFormErrors,
) => errors.summary;

export const hasObjectiveQuestionFormErrors = (
  errors: ObjectiveQuestionFormErrors,
) => errors.summary.length > 0;

export const validateObjectiveQuestionDraft = (
  draft: ObjectiveQuestionDraft,
):
  | { success: true; data: ObjectiveQuestionValues }
  | { success: false; errors: ObjectiveQuestionFormErrors } => {
  const parsed = safeParseQuestionDraft({
    ...draft,
    explanation: draft.explanation ?? "",
  });

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data as ObjectiveQuestionValues,
    };
  }

  return {
    success: false,
    errors: mapObjectiveQuestionValidationErrors(draft, parsed.error.issues),
  };
};
