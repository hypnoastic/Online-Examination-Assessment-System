import type {
  QuestionDifficulty,
  QuestionReviewMode,
  QuestionType,
} from "../../questions/domain/question.types.js";

export const EXAM_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
] as const;

export type ExamStatus = (typeof EXAM_STATUSES)[number];

export const EXAM_AUTHORING_STATUSES = ["DRAFT", "SCHEDULED"] as const;

export type ExamAuthoringStatus = (typeof EXAM_AUTHORING_STATUSES)[number];

export const EXAM_ASSIGNMENT_ROLES = ["ADMIN", "EXAMINER", "STUDENT"] as const;

export type ExamAssignmentRole = (typeof EXAM_ASSIGNMENT_ROLES)[number];

export const EXAM_ASSIGNMENT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type ExamAssignmentStatus = (typeof EXAM_ASSIGNMENT_STATUSES)[number];

export interface DraftExamQuestionSnapshot {
  sourceQuestionId: string;
  stem: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  topicId: string;
  topicName: string;
  reviewMode: QuestionReviewMode;
}

export interface DraftExamQuestionRecord {
  examQuestionId: string;
  questionOrder: number;
  marks: number;
  snapshot: DraftExamQuestionSnapshot;
}

export interface DraftExamSectionRecord {
  sectionId: string;
  title: string;
  sectionOrder: number;
  questions: DraftExamQuestionRecord[];
}

export interface DraftExamAssignmentRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  studentRole: ExamAssignmentRole;
  studentStatus: ExamAssignmentStatus;
}

export interface ExamAssignmentCandidate {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: ExamAssignmentRole;
  status: ExamAssignmentStatus;
}

export interface DraftExamValues {
  title: string;
  code: string;
  instructions: string[];
  durationMinutes: number;
  windowStartsAt: Date;
  windowEndsAt: Date;
  sections: DraftExamSectionRecord[];
  assignments: DraftExamAssignmentRecord[];
  status: ExamAuthoringStatus;
}

export interface DraftExamSummary extends DraftExamValues {
  examId: string;
}
