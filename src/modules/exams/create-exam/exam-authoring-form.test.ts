import assert from "node:assert/strict";
import test from "node:test";

import { QUESTION_BANK_SAMPLE_ENTRIES } from "../../questions/question-bank/question-bank.data.js";
import { findExamAssignmentCandidate } from "./exam-assignment-candidates.js";
import {
  addDraftExamSection,
  addStudentAssignmentToDraftExam,
  addQuestionToDraftExamSection,
  createDraftExamAuthoringDraft,
  createDraftExamSummary,
  getDraftExamAssignedStudentCount,
  getDraftExamMappedQuestionCount,
  getDraftExamPublishReadiness,
  getDraftExamSectionTotalMarks,
  getDraftExamTotalMarks,
  getDraftExamWindowDurationMinutes,
  isQuestionMappedInDraft,
  isStudentAssignedInDraft,
  moveDraftExamQuestion,
  moveDraftExamSection,
  normalizeDraftExamAuthoringDraft,
  parseDraftExamInstructions,
  publishDraftExamAuthoringDraft,
  removeStudentAssignmentFromDraftExam,
  removeQuestionFromDraftExamSection,
  updateDraftExamQuestionMarks,
  updateDraftExamSectionTitle,
  validateDraftExamAuthoringDraft,
} from "./exam-authoring-form.js";

const getQuestionBankEntry = (questionId: string) => {
  const entry = QUESTION_BANK_SAMPLE_ENTRIES.find(
    (candidate) => candidate.id === questionId,
  );

  if (!entry) {
    throw new Error(`Missing seeded question: ${questionId}`);
  }

  return entry;
};

const getAssignmentCandidate = (userId: string) => {
  const candidate = findExamAssignmentCandidate(userId);

  if (!candidate) {
    throw new Error(`Missing assignment candidate: ${userId}`);
  }

  return candidate;
};

test("draft exam validation accepts valid metadata and persists parsed instructions", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "dbms-301",
    instructionsText:
      "Read carefully.\n\nWrite answers clearly.\nSubmit before time expires.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error("Expected draft exam validation to succeed");
  }

  assert.equal(result.data.code, "DBMS-301");
  assert.deepEqual(result.data.instructions, [
    "Read carefully.",
    "Write answers clearly.",
    "Submit before time expires.",
  ]);

  const normalizedDraft = normalizeDraftExamAuthoringDraft(draft, result.data);

  assert.equal(normalizedDraft.title, "Database Systems Midterm");
  assert.equal(normalizedDraft.code, "DBMS-301");
  assert.equal(normalizedDraft.instructionsText.includes("Write answers clearly."), true);
  assert.deepEqual(normalizedDraft.sections, []);
});

test("schedule validation blocks reversed exam windows", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Operating Systems Quiz",
    code: "OS-220",
    instructionsText: "Attempt every question.",
    durationMinutes: "45",
    windowStartsAt: "2026-04-18T11:00",
    windowEndsAt: "2026-04-18T10:00",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected schedule validation to fail");
  }

  assert.deepEqual(result.errors.fields.windowEndsAt, [
    "Window end must be after the window start",
  ]);
});

test("schedule validation blocks durations that exceed the exam window", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Compiler Design Test",
    code: "CD-410",
    instructionsText: "Answer all questions.",
    durationMinutes: "120",
    windowStartsAt: "2026-04-22T09:00",
    windowEndsAt: "2026-04-22T10:00",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected duration validation to fail");
  }

  assert.deepEqual(result.errors.fields.durationMinutes, [
    "Duration must fit inside the scheduled exam window",
  ]);
});

test("draft exam summaries keep normalized metadata and derived window length", () => {
  const result = validateDraftExamAuthoringDraft(
    createDraftExamAuthoringDraft({
      title: "Computer Networks Internal",
      code: "CNS-214",
      instructionsText: "Use precise networking terminology.\nReview before submitting.",
      durationMinutes: "60",
      windowStartsAt: "2026-04-25T14:00",
      windowEndsAt: "2026-04-25T15:15",
    }),
  );

  if (!result.success) {
    throw new Error("Expected normalized draft exam data");
  }

  const summary = createDraftExamSummary(result.data);

  assert.equal(summary.status, "DRAFT");
  assert.equal(summary.examId, "draft-cns-214");
  assert.equal(getDraftExamWindowDurationMinutes(summary), 75);
  assert.deepEqual(parseDraftExamInstructions("Line one\n\nLine two"), [
    "Line one",
    "Line two",
  ]);
});

test("sections can be added, renamed, and reordered with stable sectionOrder values", () => {
  let draft = createDraftExamAuthoringDraft();

  draft = addDraftExamSection(draft);
  draft = addDraftExamSection(draft, { title: "Written Responses" });
  draft = updateDraftExamSectionTitle(
    draft,
    draft.sections[0]?.sectionId ?? "",
    "Objective Core",
  );
  draft = moveDraftExamSection(draft, draft.sections[1]?.sectionId ?? "", "up");

  assert.deepEqual(
    draft.sections.map((section) => ({
      title: section.title,
      sectionOrder: section.sectionOrder,
    })),
    [
      { title: "Written Responses", sectionOrder: 1 },
      { title: "Objective Core", sectionOrder: 2 },
    ],
  );
});

test("questions can be mapped, reordered, deduplicated, and removed inside sections", () => {
  let draft = addDraftExamSection(createDraftExamAuthoringDraft(), {
    title: "Section 1",
  });
  const sectionId = draft.sections[0]?.sectionId ?? "";

  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-204"));
  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-248"));
  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-204"));

  assert.equal(getDraftExamMappedQuestionCount(draft), 2);
  assert.equal(isQuestionMappedInDraft(draft, "Q-204"), true);

  const secondQuestionId = draft.sections[0]?.questions[1]?.examQuestionId ?? "";
  draft = moveDraftExamQuestion(draft, sectionId, secondQuestionId, "up");

  assert.deepEqual(
    draft.sections[0]?.questions.map((question) => question.snapshot.sourceQuestionId),
    ["Q-248", "Q-204"],
  );
  assert.deepEqual(
    draft.sections[0]?.questions.map((question) => question.questionOrder),
    [1, 2],
  );

  const firstQuestionId = draft.sections[0]?.questions[0]?.examQuestionId ?? "";
  draft = removeQuestionFromDraftExamSection(draft, sectionId, firstQuestionId);

  assert.deepEqual(
    draft.sections[0]?.questions.map((question) => ({
      sourceQuestionId: question.snapshot.sourceQuestionId,
      questionOrder: question.questionOrder,
    })),
    [{ sourceQuestionId: "Q-204", questionOrder: 1 }],
  );
});

test("mapped question marks persist through validation and saved draft normalization", () => {
  let draft = createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "DBMS-301",
    instructionsText: "Read carefully.\nShow working where required.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  });

  draft = addDraftExamSection(draft, { title: "Objective Core" });
  const sectionId = draft.sections[0]?.sectionId ?? "";
  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-204"));
  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-241"));
  draft = updateDraftExamQuestionMarks(
    draft,
    sectionId,
    draft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "5",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    sectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "3",
  );

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error("Expected mapped draft exam to validate");
  }

  const normalizedDraft = normalizeDraftExamAuthoringDraft(draft, result.data);
  const summary = createDraftExamSummary(result.data);

  assert.equal(getDraftExamSectionTotalMarks(normalizedDraft.sections[0]!), 8);
  assert.equal(getDraftExamTotalMarks(normalizedDraft), 8);
  assert.equal(summary.sections[0]?.questions[0]?.marks, 5);
  assert.equal(summary.sections[0]?.questions[1]?.marks, 3);
});

test("student assignments can be added, deduplicated, and removed from the draft", () => {
  let draft = createDraftExamAuthoringDraft();

  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-002"),
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );

  assert.equal(getDraftExamAssignedStudentCount(draft), 2);
  assert.equal(isStudentAssignedInDraft(draft, "user-student-001"), true);

  draft = removeStudentAssignmentFromDraftExam(draft, "user-student-001");

  assert.equal(getDraftExamAssignedStudentCount(draft), 1);
  assert.deepEqual(
    draft.assignments.map((assignment) => assignment.studentId),
    ["user-student-002"],
  );
});

test("saving blocks empty sections and invalid mapped question marks", () => {
  let emptySectionDraft = addDraftExamSection(
    createDraftExamAuthoringDraft({
      title: "Operating Systems Quiz",
      code: "OS-220",
      instructionsText: "Attempt all questions.",
      durationMinutes: "45",
      windowStartsAt: "2026-04-18T09:00",
      windowEndsAt: "2026-04-18T10:00",
    }),
    { title: "Part A" },
  );
  const emptySectionResult = validateDraftExamAuthoringDraft(emptySectionDraft);

  assert.equal(emptySectionResult.success, false);

  if (emptySectionResult.success) {
    throw new Error("Expected empty section validation to fail");
  }

  assert.deepEqual(emptySectionResult.errors.sectionFields[0]?.questions, [
    "Each section must include at least one mapped question",
  ]);

  let invalidMarksDraft = addDraftExamSection(
    createDraftExamAuthoringDraft({
      title: "Network Security Quiz",
      code: "CNS-214",
      instructionsText: "Use precise language.",
      durationMinutes: "60",
      windowStartsAt: "2026-04-25T14:00",
      windowEndsAt: "2026-04-25T15:15",
    }),
    { title: "Section 1" },
  );
  const invalidSectionId = invalidMarksDraft.sections[0]?.sectionId ?? "";

  invalidMarksDraft = addQuestionToDraftExamSection(
    invalidMarksDraft,
    invalidSectionId,
    getQuestionBankEntry("Q-238"),
  );
  invalidMarksDraft = updateDraftExamQuestionMarks(
    invalidMarksDraft,
    invalidSectionId,
    invalidMarksDraft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "0",
  );

  const invalidMarksResult = validateDraftExamAuthoringDraft(invalidMarksDraft);

  assert.equal(invalidMarksResult.success, false);

  if (invalidMarksResult.success) {
    throw new Error("Expected invalid marks validation to fail");
  }

  assert.deepEqual(invalidMarksResult.errors.questionFields[0]?.[0]?.marks, [
    "Marks must be at least 1",
  ]);
});

test("assignment validation blocks inactive students and non-student roles", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Software Engineering Assessment",
    code: "SE-315",
    instructionsText: "Answer every section carefully.",
    durationMinutes: "60",
    windowStartsAt: "2026-04-21T10:00",
    windowEndsAt: "2026-04-21T11:15",
    assignments: [
      {
        assignmentId: "assignment-1",
        studentId: "user-student-003",
        studentName: "Neha Kapoor",
        studentEmail: "neha.kapoor@college.edu",
        department: "BCA",
        studentRole: "STUDENT",
        studentStatus: "INACTIVE",
      },
      {
        assignmentId: "assignment-2",
        studentId: "user-examiner-001",
        studentName: "Rahul Verma",
        studentEmail: "rahul.verma@college.edu",
        department: "Computer Science",
        studentRole: "EXAMINER",
        studentStatus: "ACTIVE",
      },
    ],
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected invalid assignments to fail validation");
  }

  assert.deepEqual(result.errors.assignmentFields[0]?.studentStatus, [
    "Only active students can be assigned to an exam",
  ]);
  assert.deepEqual(result.errors.assignmentFields[1]?.studentRole, [
    "Only student users can be assigned to an exam",
  ]);
});

test("publish readiness requires mapped questions and active student assignments", () => {
  let draft = createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "DBMS-301",
    instructionsText: "Read carefully.\nShow working where required.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  });

  const initialReadiness = getDraftExamPublishReadiness(draft);

  assert.equal(initialReadiness.isReady, false);
  assert.deepEqual(
    initialReadiness.checks.filter((check) => !check.ready).map((check) => check.id),
    ["questions", "assignments"],
  );

  draft = addDraftExamSection(draft, { title: "Objective Core" });
  const sectionId = draft.sections[0]?.sectionId ?? "";
  draft = addQuestionToDraftExamSection(draft, sectionId, getQuestionBankEntry("Q-204"));
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );

  const publishResult = publishDraftExamAuthoringDraft(draft);

  assert.equal(publishResult.success, true);

  if (!publishResult.success) {
    throw new Error("Expected publish flow to succeed");
  }

  assert.equal(publishResult.readiness.isReady, true);
  assert.equal(publishResult.data.status, "SCHEDULED");
});
