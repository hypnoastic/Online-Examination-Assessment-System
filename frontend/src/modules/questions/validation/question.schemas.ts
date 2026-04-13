import { z } from "zod";

import {
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
  TRUE_FALSE_OPTION_LABELS,
  TRUE_FALSE_OPTION_TEXTS,
} from "../domain/question.types";

const STEM_MAX_LENGTH = 5_000;
const EXPECTED_ANSWER_MAX_LENGTH = 4_000;
const EXPLANATION_MAX_LENGTH = 4_000;
const OPTION_TEXT_MAX_LENGTH = 500;
const TOPIC_ID_MAX_LENGTH = 128;

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const requiredText = (fieldLabel: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldLabel} is required`)
    .max(maxLength, `${fieldLabel} must be at most ${maxLength} characters`);

const optionalText = (maxLength: number) =>
  z.preprocess(
    normalizeOptionalText,
    z
      .string()
      .min(1)
      .max(maxLength, `Value must be at most ${maxLength} characters`)
      .optional(),
  );

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export const questionDifficultySchema = z.enum(QUESTION_DIFFICULTIES);

export const questionTopicSchema = z.object({
  id: requiredText("Topic id", TOPIC_ID_MAX_LENGTH),
  name: requiredText("Topic name", 120),
  description: optionalText(500).nullable().optional(),
});

export const questionOptionSchema = z.object({
  id: z.string().trim().min(1).optional(),
  label: requiredText("Option label", 16).transform((label) => label.toUpperCase()),
  text: requiredText("Option text", OPTION_TEXT_MAX_LENGTH),
  isCorrect: z.boolean(),
  optionOrder: z.coerce
    .number()
    .int("Option order must be a whole number")
    .min(1, "Option order must be at least 1"),
});

const objectiveOptionsSchema = z
  .array(questionOptionSchema)
  .min(2, "At least two options are required")
  .max(6, "At most six options are supported")
  .superRefine((options, context) => {
    const seenLabels = new Set<string>();
    const seenOrders = new Set<number>();

    options.forEach((option, index) => {
      if (seenLabels.has(option.label)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option labels must be unique",
          path: [index, "label"],
        });
      } else {
        seenLabels.add(option.label);
      }

      if (seenOrders.has(option.optionOrder)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option order values must be unique",
          path: [index, "optionOrder"],
        });
      } else {
        seenOrders.add(option.optionOrder);
      }
    });
  });

const baseQuestionAuthoringSchema = z.object({
  stem: requiredText("Question stem", STEM_MAX_LENGTH),
  difficulty: questionDifficultySchema,
  topicId: requiredText("Topic", TOPIC_ID_MAX_LENGTH),
  explanation: optionalText(EXPLANATION_MAX_LENGTH),
});

export const singleChoiceQuestionSchema = baseQuestionAuthoringSchema
  .extend({
    type: z.literal("SINGLE_CHOICE"),
    options: objectiveOptionsSchema,
  })
  .superRefine((question, context) => {
    const correctOptions = question.options.filter((option) => option.isCorrect);

    if (correctOptions.length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single-choice questions must have exactly one correct option",
        path: ["options"],
      });
    }
  });

export const multipleChoiceQuestionSchema = baseQuestionAuthoringSchema
  .extend({
    type: z.literal("MULTIPLE_CHOICE"),
    options: objectiveOptionsSchema,
  })
  .superRefine((question, context) => {
    const correctOptions = question.options.filter((option) => option.isCorrect);

    if (correctOptions.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Multiple-choice questions must have at least two correct options",
        path: ["options"],
      });
    }
  });

const trueFalseOptionsSchema = objectiveOptionsSchema
  .length(2, "True/false questions must keep the fixed True and False options")
  .superRefine((options, context) => {
    const correctOptions = options.filter((option) => option.isCorrect);

    if (correctOptions.length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "True/false questions must have exactly one correct option",
        path: [],
      });
    }

    options.forEach((option, index) => {
      const expectedLabel = TRUE_FALSE_OPTION_LABELS[index];
      const expectedText = TRUE_FALSE_OPTION_TEXTS[index];

      if (option.label !== expectedLabel) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `True/false option ${index + 1} must use label ${expectedLabel}`,
          path: [index, "label"],
        });
      }

      if (option.text.toLowerCase() !== expectedText.toLowerCase()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "True/false questions must keep the fixed option texts True and False",
          path: [index, "text"],
        });
      }

      if (option.optionOrder !== index + 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True/false option order must remain fixed",
          path: [index, "optionOrder"],
        });
      }
    });
  });

export const trueFalseQuestionSchema = baseQuestionAuthoringSchema.extend({
  type: z.literal("TRUE_FALSE"),
  options: trueFalseOptionsSchema,
});

const subjectiveQuestionSchema = baseQuestionAuthoringSchema.extend({
  expectedAnswer: requiredText("Expected answer", EXPECTED_ANSWER_MAX_LENGTH),
});

export const shortTextQuestionSchema = subjectiveQuestionSchema.extend({
  type: z.literal("SHORT_TEXT"),
});

export const longTextQuestionSchema = subjectiveQuestionSchema.extend({
  type: z.literal("LONG_TEXT"),
});

export const questionSchemasByType = {
  SINGLE_CHOICE: singleChoiceQuestionSchema,
  MULTIPLE_CHOICE: multipleChoiceQuestionSchema,
  TRUE_FALSE: trueFalseQuestionSchema,
  SHORT_TEXT: shortTextQuestionSchema,
  LONG_TEXT: longTextQuestionSchema,
} as const;

export const questionAuthoringSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema,
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  shortTextQuestionSchema,
  longTextQuestionSchema,
]);

export type QuestionAuthoringInput = z.input<typeof questionAuthoringSchema>;
export type QuestionAuthoringValues = z.output<typeof questionAuthoringSchema>;

export const supportedQuestionTypesSchema = z.array(questionTypeSchema);
