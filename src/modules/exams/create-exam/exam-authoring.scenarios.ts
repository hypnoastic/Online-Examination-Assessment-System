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
} from "./exam-authoring-form.js";
import {
  findExamAssignmentCandidate,
} from "./exam-assignment-candidates.js";
import {
  QUESTION_BANK_SAMPLE_ENTRIES,
} from "../../questions/question-bank/question-bank.data.js";

const getQuestionBankEntry = (questionId: string) => {
  const entry = QUESTION_BANK_SAMPLE_ENTRIES.find(
    (candidate) => candidate.id === questionId,
  );

  if (!entry) {
    throw new Error(`Missing seeded question bank entry: ${questionId}`);
  }

  return entry;
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
  draft = addDraftExamSection(draft, { title: "Written Reasoning" });
  draft = moveDraftExamSection(draft, draft.sections[1]?.sectionId ?? "", "up");
  draft = updateDraftExamSectionTitle(
    draft,
    draft.sections[0]?.sectionId ?? "",
    "Written Reasoning",
  );
  draft = updateDraftExamSectionTitle(
    draft,
    draft.sections[1]?.sectionId ?? "",
    "Objective Core",
  );

  const writtenSectionId = draft.sections[0]?.sectionId ?? "";
  const objectiveSectionId = draft.sections[1]?.sectionId ?? "";

  draft = addQuestionToDraftExamSection(
    draft,
    writtenSectionId,
    getQuestionBankEntry("Q-238"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    writtenSectionId,
    getQuestionBankEntry("Q-281"),
  );
  draft = moveDraftExamQuestion(
    draft,
    writtenSectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "up",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    writtenSectionId,
    draft.sections[0]?.questions[0]?.examQuestionId ?? "",
    "12",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    writtenSectionId,
    draft.sections[0]?.questions[1]?.examQuestionId ?? "",
    "8",
  );

  draft = addQuestionToDraftExamSection(
    draft,
    objectiveSectionId,
    getQuestionBankEntry("Q-204"),
  );
  draft = addQuestionToDraftExamSection(
    draft,
    objectiveSectionId,
    getQuestionBankEntry("Q-248"),
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    objectiveSectionId,
    draft.sections[1]?.questions[0]?.examQuestionId ?? "",
    "4",
  );
  draft = updateDraftExamQuestionMarks(
    draft,
    objectiveSectionId,
    draft.sections[1]?.questions[1]?.examQuestionId ?? "",
    "6",
  );

  return draft;
};

const requireAssignmentCandidate = (userId: string) => {
  const candidate = findExamAssignmentCandidate(userId);

  if (!candidate) {
    throw new Error(`Missing assignment candidate: ${userId}`);
  }

  return candidate;
};

const buildPublishReadyDraft = () => {
  let draft = buildBuilderSuccessDraft();

  draft = addStudentAssignmentToDraftExam(
    draft,
    requireAssignmentCandidate("user-student-001"),
  );
  draft = addStudentAssignmentToDraftExam(
    draft,
    requireAssignmentCandidate("user-student-002"),
  );

  return draft;
};

const buildInvalidAssignmentDraft = () => {
  const draft = buildBuilderSuccessDraft();

  return {
    ...draft,
    assignments: [
      {
        ...createDraftExamAssignmentRecord(
          requireAssignmentCandidate("user-student-003"),
        ),
        assignmentId: "assignment-1",
      },
      {
        ...createDraftExamAssignmentRecord(
          requireAssignmentCandidate("user-examiner-001"),
        ),
        assignmentId: "assignment-2",
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
