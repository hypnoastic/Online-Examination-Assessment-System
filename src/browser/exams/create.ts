import {
  DRAFT_EXAM_AUTHORING_SCENARIOS,
  EXAM_ASSIGNMENT_CANDIDATES,
  addDraftExamSection,
  addQuestionToDraftExamSection,
  addStudentAssignmentToDraftExam,
  createDraftExamAuthoringDraft,
  createDraftExamSummary,
  createEmptyDraftExamFormErrors,
  findExamAssignmentCandidate,
  moveDraftExamQuestion,
  moveDraftExamSection,
  normalizeDraftExamAuthoringDraft,
  publishDraftExamAuthoringDraft,
  removeDraftExamSection,
  removeQuestionFromDraftExamSection,
  removeStudentAssignmentFromDraftExam,
  type DraftExamAuthoringDraft,
  type DraftExamSummary,
  updateDraftExamField,
  updateDraftExamQuestionMarks,
  updateDraftExamSectionTitle,
  validateDraftExamAuthoringDraft,
} from "../../modules/exams/index";
import { renderCreateDraftExamPage } from "../../modules/exams/create-exam/ui/create-draft-exam-page";

const root = document.querySelector<HTMLElement>("[data-create-exam-root]");

if (!root) {
  throw new Error("Draft exam root element is missing.");
}

const query = new URLSearchParams(window.location.search);

type DraftExamFieldKey = keyof Omit<
  DraftExamAuthoringDraft,
  "sections" | "assignments" | "status"
>;
type FocusableField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null;

const getInitialActiveSectionId = (draft: DraftExamAuthoringDraft) =>
  draft.sections[0]?.sectionId ?? null;

const getSafeActiveSectionId = (
  draft: DraftExamAuthoringDraft,
  preferredSectionId: string | null,
) => {
  if (draft.sections.length === 0) {
    return null;
  }

  if (
    preferredSectionId &&
    draft.sections.some((section) => section.sectionId === preferredSectionId)
  ) {
    return preferredSectionId;
  }

  return draft.sections[0]?.sectionId ?? null;
};

const getDraftWithQueryOverrides = (draft: DraftExamAuthoringDraft) => {
  let nextDraft = draft;

  (
    [
      "title",
      "code",
      "instructionsText",
      "durationMinutes",
      "windowStartsAt",
      "windowEndsAt",
    ] as DraftExamFieldKey[]
  ).forEach((field) => {
    const value = query.get(field);

    if (value !== null) {
      nextDraft = updateDraftExamField(nextDraft, field, value);
    }
  });

  return nextDraft;
};

const getInitialDraft = () => {
  const scenario = query.get("scenario");

  if (scenario && DRAFT_EXAM_AUTHORING_SCENARIOS[scenario]) {
    return getDraftWithQueryOverrides(
      structuredClone(DRAFT_EXAM_AUTHORING_SCENARIOS[scenario]),
    );
  }

  return getDraftWithQueryOverrides(createDraftExamAuthoringDraft());
};

const initialDraft = getInitialDraft();

const state: {
  activeSectionId: string | null;
  draft: DraftExamAuthoringDraft;
  baseDraft: DraftExamAuthoringDraft;
  errors: ReturnType<typeof createEmptyDraftExamFormErrors>;
  lastSavedExam: DraftExamSummary | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
} = {
  activeSectionId: getInitialActiveSectionId(initialDraft),
  draft: structuredClone(initialDraft),
  baseDraft: structuredClone(initialDraft),
  errors: createEmptyDraftExamFormErrors(),
  lastSavedExam: null,
  status: null,
};

const captureFocus = () => {
  const activeElement = document.activeElement as FocusableField;

  if (
    !(activeElement instanceof HTMLInputElement) &&
    !(activeElement instanceof HTMLTextAreaElement) &&
    !(activeElement instanceof HTMLSelectElement)
  ) {
    return null;
  }

  const focusId = activeElement.dataset.focusId;

  if (!focusId) {
    return null;
  }

  return {
    focusId,
    selectionStart:
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
        ? activeElement.selectionStart
        : null,
    selectionEnd:
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
        ? activeElement.selectionEnd
        : null,
  };
};

const restoreFocus = (focusSnapshot: ReturnType<typeof captureFocus>) => {
  if (!focusSnapshot) {
    return;
  }

  const nextField = root.querySelector<HTMLElement>(
    `[data-focus-id="${focusSnapshot.focusId}"]`,
  );

  if (
    !nextField ||
    !(
      nextField instanceof HTMLInputElement ||
      nextField instanceof HTMLTextAreaElement ||
      nextField instanceof HTMLSelectElement
    )
  ) {
    return;
  }

  nextField.focus();

  if (
    (nextField instanceof HTMLInputElement ||
      nextField instanceof HTMLTextAreaElement) &&
    focusSnapshot.selectionStart !== null &&
    focusSnapshot.selectionEnd !== null
  ) {
    nextField.setSelectionRange(
      focusSnapshot.selectionStart,
      focusSnapshot.selectionEnd,
    );
  }
};

const render = (focusSnapshot: ReturnType<typeof captureFocus> = null) => {
  root.innerHTML = renderCreateDraftExamPage({
    activeSectionId: state.activeSectionId,
    assignmentCandidates: EXAM_ASSIGNMENT_CANDIDATES,
    draft: state.draft,
    errors: state.errors,
    lastSavedExam: state.lastSavedExam,
    questionBankEntries: QUESTION_BANK_SAMPLE_ENTRIES,
    status: state.status,
  });
  restoreFocus(focusSnapshot);
};

const resetFeedback = () => {
  state.errors = createEmptyDraftExamFormErrors();
  state.status = null;
};

const syncStateDraft = (
  nextDraft: DraftExamAuthoringDraft,
  preferredSectionId: string | null = state.activeSectionId,
) => {
  state.draft = nextDraft;
  state.activeSectionId = getSafeActiveSectionId(nextDraft, preferredSectionId);
};

const submitDraft = () => {
  const result = validateDraftExamAuthoringDraft(state.draft);

  if (!result.success) {
    state.errors = result.errors;
    state.status = {
      tone: "error",
      title: "Draft exam blocked",
      detail:
        "Fix the highlighted metadata, assignment, or mapped-question issues before this exam can be saved.",
    };
    render();
    return;
  }

  state.errors = createEmptyDraftExamFormErrors();
  state.draft = normalizeDraftExamAuthoringDraft(state.draft, result.data);
  state.baseDraft = structuredClone(state.draft);
  state.activeSectionId = getSafeActiveSectionId(
    state.draft,
    state.activeSectionId,
  );
  state.lastSavedExam = createDraftExamSummary(result.data);
  state.status = {
    tone: "success",
    title: state.draft.status === "SCHEDULED" ? "Scheduled exam saved" : "Draft exam saved",
    detail:
      "Metadata, mapped question snapshots, and student assignments passed validation and were stored in the exam workspace.",
  };
  render();
};

const publishExam = () => {
  const result = publishDraftExamAuthoringDraft(state.draft);

  if (!result.success) {
    state.errors = result.errors;
    state.status = {
      tone: "error",
      title: "Publish blocked",
      detail:
        "The exam cannot move to scheduled availability until the readiness checks and validation issues are resolved.",
    };
    render();
    return;
  }

  state.errors = createEmptyDraftExamFormErrors();
  state.draft = normalizeDraftExamAuthoringDraft(state.draft, result.data);
  state.baseDraft = structuredClone(state.draft);
  state.activeSectionId = getSafeActiveSectionId(
    state.draft,
    state.activeSectionId,
  );
  state.lastSavedExam = createDraftExamSummary(result.data);
  state.status = {
    tone: "success",
    title: "Exam scheduled",
    detail:
      "Questions, schedule, and assignments passed the publish gate, so the exam is now marked as scheduled.",
  };
  render();
};

root.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  const focusSnapshot = captureFocus();

  if (target.dataset.field) {
    const field = target.dataset.field as DraftExamFieldKey;

    syncStateDraft(updateDraftExamField(state.draft, field, target.value));
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (target.dataset.sectionField === "title" && target.dataset.sectionId) {
    syncStateDraft(
      updateDraftExamSectionTitle(
        state.draft,
        target.dataset.sectionId,
        target.value,
      ),
      target.dataset.sectionId,
    );
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target.dataset.questionField === "marks" &&
    target.dataset.sectionId &&
    target.dataset.examQuestionId
  ) {
    syncStateDraft(
      updateDraftExamQuestionMarks(
        state.draft,
        target.dataset.sectionId,
        target.dataset.examQuestionId,
        target.value,
      ),
      target.dataset.sectionId,
    );
    resetFeedback();
    render(focusSnapshot);
  }
});

root.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const actionTrigger = target.closest<HTMLElement>("[data-action]");

  if (!actionTrigger) {
    return;
  }

  const focusSnapshot = captureFocus();
  const sectionId = actionTrigger.dataset.sectionId ?? null;
  const examQuestionId = actionTrigger.dataset.examQuestionId ?? null;

  switch (actionTrigger.dataset.action) {
    case "add-section": {
      const nextDraft = addDraftExamSection(state.draft);
      const nextSectionId = nextDraft.sections.at(-1)?.sectionId ?? null;

      syncStateDraft(nextDraft, nextSectionId);
      resetFeedback();
      render();
      return;
    }
    case "activate-section":
      state.activeSectionId = sectionId;
      render();
      return;
    case "move-section-up":
    case "move-section-down":
      if (!sectionId) {
        return;
      }

      syncStateDraft(
        moveDraftExamSection(
          state.draft,
          sectionId,
          actionTrigger.dataset.action === "move-section-up" ? "up" : "down",
        ),
        sectionId,
      );
      resetFeedback();
      render(focusSnapshot);
      return;
    case "remove-section":
      if (!sectionId) {
        return;
      }

      syncStateDraft(
        removeDraftExamSection(state.draft, sectionId),
        state.activeSectionId === sectionId ? null : state.activeSectionId,
      );
      resetFeedback();
      render();
      return;
    case "map-question": {
      const questionId = actionTrigger.dataset.questionId ?? null;
      const activeSectionId = state.activeSectionId;
      const questionEntry = QUESTION_BANK_SAMPLE_ENTRIES.find(
        (entry) => entry.id === questionId,
      );

      if (!questionEntry || !activeSectionId) {
        return;
      }

      syncStateDraft(
        addQuestionToDraftExamSection(state.draft, activeSectionId, questionEntry),
        activeSectionId,
      );
      resetFeedback();
      render();
      return;
    }
    case "move-question-up":
    case "move-question-down":
      if (!sectionId || !examQuestionId) {
        return;
      }

      syncStateDraft(
        moveDraftExamQuestion(
          state.draft,
          sectionId,
          examQuestionId,
          actionTrigger.dataset.action === "move-question-up" ? "up" : "down",
        ),
        sectionId,
      );
      resetFeedback();
      render();
      return;
    case "remove-question":
      if (!sectionId || !examQuestionId) {
        return;
      }

      syncStateDraft(
        removeQuestionFromDraftExamSection(
          state.draft,
          sectionId,
          examQuestionId,
        ),
        sectionId,
      );
      resetFeedback();
      render();
      return;
    case "assign-student": {
      const studentId = actionTrigger.dataset.studentId ?? null;
      const candidate = studentId ? findExamAssignmentCandidate(studentId) : null;

      if (!candidate) {
        return;
      }

      syncStateDraft(addStudentAssignmentToDraftExam(state.draft, candidate));
      resetFeedback();
      render();
      return;
    }
    case "remove-assignment": {
      const studentId = actionTrigger.dataset.studentId ?? null;

      if (!studentId) {
        return;
      }

      syncStateDraft(removeStudentAssignmentFromDraftExam(state.draft, studentId));
      resetFeedback();
      render();
      return;
    }
    case "reset-draft":
      state.draft = structuredClone(state.baseDraft);
      state.activeSectionId = getInitialActiveSectionId(state.baseDraft);
      state.errors = createEmptyDraftExamFormErrors();
      state.status = null;
      render();
      return;
    case "submit-draft":
      submitDraft();
      return;
    case "publish-exam":
      publishExam();
      return;
    default:
      return;
  }
});

render();

if (query.get("submit") === "1") {
  submitDraft();
}

if (query.get("publish") === "1") {
  publishExam();
}
