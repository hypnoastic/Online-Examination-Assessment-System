import { z } from "zod";

const TITLE_MAX_LENGTH = 180;
const CODE_MAX_LENGTH = 32;
const INSTRUCTION_MAX_LENGTH = 500;

const requiredText = (fieldLabel: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldLabel} is required`)
    .max(maxLength, `${fieldLabel} must be at most ${maxLength} characters`);

const parseDateInput = (value: unknown) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const dateField = (fieldLabel: string) =>
  z.any().transform((value, context) => {
    const parsed = parseDateInput(value);

    if (!(parsed instanceof Date)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel} is required`,
      });
      return z.NEVER;
    }

    return parsed;
  });

export const examCodeSchema = requiredText("Exam code", CODE_MAX_LENGTH)
  .transform((code) => code.toUpperCase())
  .refine(
    (code) => /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code),
    "Exam code must use letters, numbers, and hyphens only",
  );

export const draftExamSchema = z
  .object({
    title: requiredText("Exam title", TITLE_MAX_LENGTH),
    code: examCodeSchema,
    instructions: z
      .array(requiredText("Instruction", INSTRUCTION_MAX_LENGTH))
      .min(1, "At least one instruction is required")
      .max(12, "At most twelve instruction lines are supported"),
    durationMinutes: z.coerce
      .number()
      .int("Duration must be a whole number")
      .min(1, "Duration must be at least 1 minute")
      .max(600, "Duration must be at most 600 minutes"),
    windowStartsAt: dateField("Window start"),
    windowEndsAt: dateField("Window end"),
    status: z.literal("DRAFT"),
  })
  .superRefine((exam, context) => {
    if (exam.windowStartsAt.getTime() >= exam.windowEndsAt.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Window end must be after the window start",
        path: ["windowEndsAt"],
      });
      return;
    }

    const windowDurationMinutes =
      (exam.windowEndsAt.getTime() - exam.windowStartsAt.getTime()) /
      (60 * 1000);

    if (windowDurationMinutes < exam.durationMinutes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duration must fit inside the scheduled exam window",
        path: ["durationMinutes"],
      });
    }
  });

export type DraftExamInput = z.input<typeof draftExamSchema>;
export type DraftExamValidatedValues = z.output<typeof draftExamSchema>;
