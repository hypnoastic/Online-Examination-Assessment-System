import type { AssignedExamRecord } from "../domain/assigned-exam.types";
import type { AttemptBootstrapRecord } from "../domain/attempt-session.types";
import { toBootstrapAttemptId } from "./attempt-identifiers.ts";

const STUDENT_ATTEMPT_DEMO_RECORDS: AttemptBootstrapRecord[] = [
  {
    assignmentId: "assignment-dbms-midterm",
    examId: "exam-dbms-midterm",
    examTitle: "DBMS Midterm",
    examCode: "DBMS-301",
    durationMinutes: 90,
    windowStartsAt: new Date("2026-04-12T09:00:00+05:30"),
    windowEndsAt: new Date("2026-04-12T10:30:00+05:30"),
    windowStatus: "OPEN",
    isManuallyBlocked: false,
    attempt: null,
    sessionTemplate: {
      instructions: [
        "Read every question carefully before answering.",
        "Objective responses auto-save in later prompts; subjective responses should be concise and accurate.",
        "Do not refresh during the live attempt unless the session recovery flow instructs you to.",
      ],
      questions: [
        {
          examQuestionId: "eq-dbms-1",
          questionId: "question-dbms-1",
          questionOrder: 1,
          type: "SINGLE_CHOICE",
          reviewMode: "OBJECTIVE",
          stem: "Which normal form removes partial dependency from a relation?",
          maxMarks: 2,
          options: [
            { id: "opt-dbms-1-a", label: "A", text: "First Normal Form" },
            { id: "opt-dbms-1-b", label: "B", text: "Second Normal Form" },
            { id: "opt-dbms-1-c", label: "C", text: "Third Normal Form" },
            { id: "opt-dbms-1-d", label: "D", text: "BCNF" },
          ],
        },
        {
          examQuestionId: "eq-dbms-2",
          questionId: "question-dbms-2",
          questionOrder: 2,
          type: "SHORT_TEXT",
          reviewMode: "MANUAL",
          stem: "Explain why transaction isolation is important in OLTP systems.",
          maxMarks: 5,
        },
        {
          examQuestionId: "eq-dbms-3",
          questionId: "question-dbms-3",
          questionOrder: 3,
          type: "TRUE_FALSE",
          reviewMode: "OBJECTIVE",
          stem: "A foreign key must always reference a primary key in the same table.",
          maxMarks: 1,
          options: [
            { id: "opt-dbms-3-a", label: "A", text: "True" },
            { id: "opt-dbms-3-b", label: "B", text: "False" },
          ],
        },
      ],
    },
  },
  {
    assignmentId: "assignment-network-security",
    examId: "exam-network-security",
    examTitle: "Network Security Quiz",
    examCode: "CNS-214",
    durationMinutes: 60,
    windowStartsAt: new Date("2026-04-12T09:15:00+05:30"),
    windowEndsAt: new Date("2026-04-12T10:15:00+05:30"),
    windowStatus: "OPEN",
    isManuallyBlocked: false,
    attempt: {
      attemptId: "attempt-network-security-1",
      status: "IN_PROGRESS",
      startedAt: new Date("2026-04-12T09:18:00+05:30"),
      expiresAt: new Date("2026-04-12T10:18:00+05:30"),
      submittedAt: null,
    },
    sessionTemplate: {
      instructions: [
        "Resume the active attempt from the saved question order.",
        "Network Security Quiz is objective-heavy, so keep track of time before reviewing marked questions.",
      ],
      questions: [
        {
          examQuestionId: "eq-cns-1",
          questionId: "question-cns-1",
          questionOrder: 1,
          type: "MULTIPLE_CHOICE",
          reviewMode: "OBJECTIVE",
          stem: "Select protocols commonly used to secure web traffic.",
          maxMarks: 3,
          options: [
            { id: "opt-cns-1-a", label: "A", text: "TLS" },
            { id: "opt-cns-1-b", label: "B", text: "SSH" },
            { id: "opt-cns-1-c", label: "C", text: "HTTPS" },
            { id: "opt-cns-1-d", label: "D", text: "ARP" },
          ],
        },
        {
          examQuestionId: "eq-cns-2",
          questionId: "question-cns-2",
          questionOrder: 2,
          type: "SHORT_TEXT",
          reviewMode: "MANUAL",
          stem: "Describe one practical defense against replay attacks.",
          maxMarks: 4,
        },
        {
          examQuestionId: "eq-cns-3",
          questionId: "question-cns-3",
          questionOrder: 3,
          type: "SINGLE_CHOICE",
          reviewMode: "OBJECTIVE",
          stem: "Which device typically filters packets based on rule sets?",
          maxMarks: 2,
          options: [
            { id: "opt-cns-3-a", label: "A", text: "Firewall" },
            { id: "opt-cns-3-b", label: "B", text: "Load balancer" },
            { id: "opt-cns-3-c", label: "C", text: "Switch" },
            { id: "opt-cns-3-d", label: "D", text: "Repeater" },
          ],
        },
      ],
    },
  },
  {
    assignmentId: "assignment-os-viva",
    examId: "exam-os-viva",
    examTitle: "Operating Systems Viva",
    examCode: "OS-220",
    durationMinutes: 45,
    windowStartsAt: new Date("2026-04-18T09:00:00+05:30"),
    windowEndsAt: new Date("2026-04-18T09:45:00+05:30"),
    windowStatus: "UPCOMING",
    isManuallyBlocked: false,
    attempt: null,
    sessionTemplate: {
      instructions: [
        "This viva stays locked until the scheduled start time.",
      ],
      questions: [
        {
          examQuestionId: "eq-os-1",
          questionId: "question-os-1",
          questionOrder: 1,
          type: "LONG_TEXT",
          reviewMode: "MANUAL",
          stem: "Explain the difference between a process and a thread with examples.",
          maxMarks: 8,
        },
      ],
    },
  },
  {
    assignmentId: "assignment-java-lab",
    examId: "exam-java-lab",
    examTitle: "Java Lab Assessment",
    examCode: "JAVA-118",
    durationMinutes: 75,
    windowStartsAt: new Date("2026-04-12T09:30:00+05:30"),
    windowEndsAt: new Date("2026-04-12T10:45:00+05:30"),
    windowStatus: "OPEN",
    isManuallyBlocked: true,
    attempt: null,
    sessionTemplate: {
      instructions: [
        "This lab is blocked until the examiner re-enables access.",
      ],
      questions: [
        {
          examQuestionId: "eq-java-1",
          questionId: "question-java-1",
          questionOrder: 1,
          type: "LONG_TEXT",
          reviewMode: "MANUAL",
          stem: "Design a class hierarchy for a grading workflow using inheritance where appropriate.",
          maxMarks: 10,
        },
      ],
    },
  },
  {
    assignmentId: "assignment-discrete",
    examId: "exam-discrete",
    examTitle: "Discrete Mathematics Practice Test",
    examCode: "MTH-204",
    durationMinutes: 60,
    windowStartsAt: new Date("2026-04-10T08:00:00+05:30"),
    windowEndsAt: new Date("2026-04-10T09:00:00+05:30"),
    windowStatus: "CLOSED",
    isManuallyBlocked: false,
    attempt: {
      attemptId: "attempt-discrete-1",
      status: "SUBMITTED",
      startedAt: new Date("2026-04-10T08:05:00+05:30"),
      expiresAt: new Date("2026-04-10T09:05:00+05:30"),
      submittedAt: new Date("2026-04-10T08:56:00+05:30"),
    },
    sessionTemplate: {
      instructions: [
        "This practice test has already been submitted and cannot be reopened.",
      ],
      questions: [
        {
          examQuestionId: "eq-mth-1",
          questionId: "question-mth-1",
          questionOrder: 1,
          type: "SINGLE_CHOICE",
          reviewMode: "OBJECTIVE",
          stem: "Which law states that p ∧ (q ∨ r) = (p ∧ q) ∨ (p ∧ r)?",
          maxMarks: 2,
          options: [
            { id: "opt-mth-1-a", label: "A", text: "Associative law" },
            { id: "opt-mth-1-b", label: "B", text: "Distributive law" },
            { id: "opt-mth-1-c", label: "C", text: "De Morgan's law" },
            { id: "opt-mth-1-d", label: "D", text: "Absorption law" },
          ],
        },
        {
          examQuestionId: "eq-mth-2",
          questionId: "question-mth-2",
          questionOrder: 2,
          type: "SHORT_TEXT",
          reviewMode: "MANUAL",
          stem: "Define a bijection in one or two sentences.",
          maxMarks: 3,
        },
      ],
    },
  },
];

const stripBootstrapRecord = (
  record: AttemptBootstrapRecord,
): AssignedExamRecord => ({
  assignmentId: record.assignmentId,
  examId: record.examId,
  examTitle: record.examTitle,
  examCode: record.examCode,
  durationMinutes: record.durationMinutes,
  windowStartsAt: record.windowStartsAt,
  windowEndsAt: record.windowEndsAt,
  windowStatus: record.windowStatus,
  isManuallyBlocked: record.isManuallyBlocked,
  attempt: record.attempt,
});

export const listStudentAttemptBootstrapRecords = ():
  readonly AttemptBootstrapRecord[] => STUDENT_ATTEMPT_DEMO_RECORDS;

export const listStudentAssignedExamRecords = (): AssignedExamRecord[] =>
  STUDENT_ATTEMPT_DEMO_RECORDS.map(stripBootstrapRecord);

export const findStudentAttemptBootstrapRecordByExamId = (
  examId: string,
): AttemptBootstrapRecord | null =>
  STUDENT_ATTEMPT_DEMO_RECORDS.find((record) => record.examId === examId) ??
  null;

export const findStudentAttemptBootstrapRecordByAttemptId = (
  attemptId: string,
): AttemptBootstrapRecord | null =>
  STUDENT_ATTEMPT_DEMO_RECORDS.find((record) => {
    if (record.attempt?.attemptId === attemptId) {
      return true;
    }

    return record.attempt === null && toBootstrapAttemptId(record.examId) === attemptId;
  }) ?? null;
