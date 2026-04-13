import {
  addDraftExamSection,
  addStudentAssignmentToDraftExam,
  addQuestionToDraftExamSection,
  createDraftExamAuthoringDraft,
  createDraftExamAssignmentRecord,
  moveDraftExamQuestion,
  moveDraftExamSection,
  updateDraftExamQuestionMarks,
  updateDraftExamSectionTitle,
  type DraftExamAuthoringDraft,
} from "./exam-authoring-form";
import { QUESTION_BANK_SAMPLE_ENTRIES } from "../../questions/question-bank/question-bank.data.js";
import { findExamAssignmentCandidate } from "./exam-assignment-candidates.js";

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

const buildBuilderSuccessDraft = () => {
  let draft = createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "DBMS-301",
    instructionsText:
      "Read every question carefully before answering.\nAnswer subjective questions with concise technical language.\nSubmit before the exam window closes.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  });

  draft = addDraftExamSection(draft, { title: "Objective Core" });
  draft = addDraftExamSection(draft, { title: "Applied Problems" });
  draft = updateDraftExamSectionTitle(
    draft,
    draft.sections[1]?.sectionId ?? "",
    "Applied Problems",
  );

  const objectiveSectionId = draft.sections[0]?.sectionId ?? "";
  const appliedSectionId = draft.sections[1]?.sectionId ?? "";

  draft = addQuestionToDraftExamSection(
    draft,
    objectiveSectionId,
    getQuestionBankEntry("Q-204"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    objectiveSectionId,
    getQuestionBankEntry("Q-241"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    appliedSectionId,
    getQuestionBankEntry("Q-248"),
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    objectiveSectionId,
    draft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "5",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    objectiveSectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "5",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    appliedSectionId,
    draft.sections[1]?.questions[0]?.examQuestionId ?? "",
    "10",
  );
  draft = moveDraftExamQuestion(
    draft,
    objectiveSectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "up",
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-002"),
  );

  return draft;
};

const buildPublishReadyDraft = () => {
  let draft = createDraftExamAuthoringDraft({
    title: "Computer Networks Internal",
    code: "CNS-214",
    instructionsText:
      "Use precise networking terminology.\nReview before submitting.",
    durationMinutes: "60",
    windowStartsAt: "2026-04-25T14:00",
    windowEndsAt: "2026-04-25T15:15",
  });

  draft = addDraftExamSection(draft, { title: "Core Concepts" });
  draft = addDraftExamSection(draft, { title: "Applied Scenarios" });
  draft = moveDraftExamSection(
    draft,
    draft.sections[1]?.sectionId ?? "",
    "up",
  );

  const coreSectionId = draft.sections[0]?.sectionId ?? "";
  const appliedSectionId = draft.sections[1]?.sectionId ?? "";

  draft = addQuestionToDraftExamSection(
    draft,
    coreSectionId,
    getQuestionBankEntry("Q-225"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    coreSectionId,
    getQuestionBankEntry("Q-238"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    appliedSectionId,
    getQuestionBankEntry("Q-248"),
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    coreSectionId,
    draft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "4",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    coreSectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "6",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    appliedSectionId,
    draft.sections[1]?.questions[0]?.examQuestionId ?? "",
    "10",
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-002"),
  );

  return draft;
};

const buildInvalidAssignmentDraft = () => {
  let draft = createDraftExamAuthoringDraft({
    title: "Software Engineering Assessment",
    code: "SE-315",
    instructionsText: "Answer every section carefully.",
    durationMinutes: "60",
    windowStartsAt: "2026-04-21T10:00",
    windowEndsAt: "2026-04-21T11:15",
  });

  draft = addDraftExamSection(draft, { title: "Assessment Core" });
  const sectionId = draft.sections[0]?.sectionId ?? "";
  draft = addQuestionToDraftExamSection(
    draft,
    sectionId,
    getQuestionBankEntry("Q-238"),
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    sectionId,
    draft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "10",
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    getAssignmentCandidate("user-student-001"),
  );

  return {
    ...draft,
    assignments: [
      ...draft.assignments,
      {
        ...createDraftExamAssignmentRecord(
          getAssignmentCandidate("user-student-003"),
        ),
        assignmentId: "assignment-2",
      },
      {
        ...createDraftExamAssignmentRecord(
          getAssignmentCandidate("user-examiner-001"),
        ),
        assignmentId: "assignment-3",
      },
    ],
  };
};

export const DRAFT_EXAM_AUTHORING_SCENARIOS: Record<
  string,
  DraftExamAuthoringDraft
> = {
  "draft-success": createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "DBMS-301",
    instructionsText:
      "Read every question carefully before answering.\nAnswer subjective questions with concise technical language.\nSubmit before the exam window closes.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  }),
  "builder-success": buildBuilderSuccessDraft(),
  "publish-ready": buildPublishReadyDraft(),
  "invalid-window": createDraftExamAuthoringDraft({
    title: "Operating Systems Quiz",
    code: "OS-220",
    instructionsText:
      "Attempt all questions.\nDo not switch browser tabs during the quiz.",
    durationMinutes: "60",
    windowStartsAt: "2026-04-18T11:00",
    windowEndsAt: "2026-04-18T10:00",
  }),
  "invalid-empty-section": addDraftExamSection(
    createDraftExamAuthoringDraft({
      title: "Compiler Design Test",
      code: "CD-410",
      instructionsText: "Answer all questions.\nKeep notation precise.",
      durationMinutes: "60",
      windowStartsAt: "2026-04-22T09:00",
      windowEndsAt: "2026-04-22T10:30",
    }),
    { title: "Part A" },
  ),
  "invalid-assignment": buildInvalidAssignmentDraft(),
};
