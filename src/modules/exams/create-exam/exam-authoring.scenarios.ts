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
