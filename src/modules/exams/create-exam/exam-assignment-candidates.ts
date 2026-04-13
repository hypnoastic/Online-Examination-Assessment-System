import { listAdminUserRecords } from "../../admin/utils/user-list.js";
import type { ExamAssignmentCandidate } from "../domain/exam.types.js";

export const EXAM_ASSIGNMENT_CANDIDATES: ExamAssignmentCandidate[] =
  listAdminUserRecords().map((record) => ({
    userId: record.id,
    name: record.name,
    email: record.email,
    department: record.department,
    role: record.role,
    status: record.status,
  }));

export const findExamAssignmentCandidate = (userId: string) =>
  EXAM_ASSIGNMENT_CANDIDATES.find((candidate) => candidate.userId === userId) ??
  null;
