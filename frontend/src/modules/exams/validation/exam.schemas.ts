import { z } from "zod";

import {
  EXAM_ASSIGNMENT_ROLES,
  EXAM_ASSIGNMENT_STATUSES,
  EXAM_AUTHORING_STATUSES,
} from "../domain/exam.types.js";
import {
  QUESTION_DIFFICULTIES,
  QUESTION_REVIEW_MODES,
  QUESTION_TYPES,
} from "../../questions/domain/question.types.js";

const TITLE_MAX_LENGTH = 180;
const CODE_MAX_LENGTH = 32;
const INSTRUCTION_MAX_LENGTH = 500;
const SECTION_TITLE_MAX_LENGTH = 120;
const ID_MAX_LENGTH = 128;

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

const draftExamQuestionSnapshotSchema = z.object({
  sourceQuestionId: requiredText("Source question id", ID_MAX_LENGTH),
  stem: requiredText("Question stem", 5_000),
  type: z.enum(QUESTION_TYPES),
  difficulty: z.enum(QUESTION_DIFFICULTIES),
  topicId: requiredText("Topic id", ID_MAX_LENGTH),
  topicName: requiredText("Topic name", 120),
  reviewMode: z.enum(QUESTION_REVIEW_MODES),
});

const draftExamQuestionSchema = z.object({
  examQuestionId: requiredText("Exam question id", ID_MAX_LENGTH),
  questionOrder: z.coerce
    .number()
    .int("Question order must be a whole number")
    .min(1, "Question order must be at least 1"),
  marks: z.coerce
    .number()
    .int("Marks must be a whole number")
    .min(1, "Marks must be at least 1")
    .max(100, "Marks must be at most 100"),
  snapshot: draftExamQuestionSnapshotSchema,
});

const draftExamSectionSchema = z
  .object({
    sectionId: requiredText("Section id", ID_MAX_LENGTH),
    title: requiredText("Section title", SECTION_TITLE_MAX_LENGTH),
    sectionOrder: z.coerce
      .number()
      .int("Section order must be a whole number")
      .min(1, "Section order must be at least 1"),
    questions: z
      .array(draftExamQuestionSchema)
      .min(1, "Each section must include at least one mapped question")
      .max(30, "Each section supports at most 30 mapped questions"),
  })
  .superRefine((section, context) => {
    const seenQuestionOrders = new Set<number>();
    const seenExamQuestionIds = new Set<string>();

    section.questions.forEach((question, index) => {
      if (seenQuestionOrders.has(question.questionOrder)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Question order values must be unique within a section",
          path: ["questions", index, "questionOrder"],
        });
      } else {
        seenQuestionOrders.add(question.questionOrder);
      }

      if (seenExamQuestionIds.has(question.examQuestionId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exam question ids must stay unique within a section",
          path: ["questions", index],
        });
      } else {
        seenExamQuestionIds.add(question.examQuestionId);
      }
    });
  });

const draftExamAssignmentSchema = z.object({
  assignmentId: requiredText("Assignment id", ID_MAX_LENGTH),
  studentId: requiredText("Student id", ID_MAX_LENGTH),
  studentName: requiredText("Student name", 180),
  studentEmail: z
    .string()
    .trim()
    .email("Student email must be a valid email address"),
  department: requiredText("Department", 180),
  studentRole: z.enum(EXAM_ASSIGNMENT_ROLES),
  studentStatus: z.enum(EXAM_ASSIGNMENT_STATUSES),
});

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
    sections: z.array(draftExamSectionSchema).max(12, "At most twelve sections are supported"),
    assignments: z
      .array(draftExamAssignmentSchema)
      .max(500, "At most five hundred student assignments are supported"),
    status: z.enum(EXAM_AUTHORING_STATUSES),
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

    const seenSectionOrders = new Set<number>();
    const seenSourceQuestionIds = new Set<string>();
    const seenAssignmentIds = new Set<string>();
    const seenStudentIds = new Set<string>();

    exam.sections.forEach((section, sectionIndex) => {
      if (seenSectionOrders.has(section.sectionOrder)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Section order values must be unique",
          path: ["sections", sectionIndex, "sectionOrder"],
        });
      } else {
        seenSectionOrders.add(section.sectionOrder);
      }

      section.questions.forEach((question, questionIndex) => {
        if (seenSourceQuestionIds.has(question.snapshot.sourceQuestionId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Each source question can only be mapped once in a draft exam",
            path: ["sections", sectionIndex, "questions", questionIndex],
          });
        } else {
          seenSourceQuestionIds.add(question.snapshot.sourceQuestionId);
        }
      });
    });

    exam.assignments.forEach((assignment, assignmentIndex) => {
      if (seenAssignmentIds.has(assignment.assignmentId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assignment ids must stay unique within an exam",
          path: ["assignments", assignmentIndex, "assignmentId"],
        });
      } else {
        seenAssignmentIds.add(assignment.assignmentId);
      }

      if (seenStudentIds.has(assignment.studentId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each student can only be assigned once to an exam",
          path: ["assignments", assignmentIndex, "studentId"],
        });
      } else {
        seenStudentIds.add(assignment.studentId);
      }

      if (assignment.studentRole !== "STUDENT") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only student users can be assigned to an exam",
          path: ["assignments", assignmentIndex, "studentRole"],
        });
      }

      if (assignment.studentStatus !== "ACTIVE") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only active students can be assigned to an exam",
          path: ["assignments", assignmentIndex, "studentStatus"],
        });
      }
    });
  });

export type DraftExamInput = z.input<typeof draftExamSchema>;
export type DraftExamValidatedValues = z.output<typeof draftExamSchema>;
