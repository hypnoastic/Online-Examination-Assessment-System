import {
  DRAFT_EXAM_AUTHORING_SCENARIOS,
  createDraftExamAuthoringDraft,
  createDraftExamSummary,
  createEmptyDraftExamFormErrors,
  normalizeDraftExamAuthoringDraft,
  type DraftExamAuthoringDraft,
  type DraftExamSummary,
  updateDraftExamField,
  validateDraftExamAuthoringDraft,
} from "../../modules/exams/index";
import { renderCreateDraftExamPage } from "../../modules/exams/create-exam/ui/create-draft-exam-page";

const root = document.querySelector<HTMLElement>("[data-create-exam-root]");

if (!root) {
  throw new Error("Draft exam root element is missing.");
}

const query = new URLSearchParams(window.location.search);

type DraftExamFieldKey = keyof DraftExamAuthoringDraft;
type FocusableField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null;

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
  draft: DraftExamAuthoringDraft;
  baseDraft: DraftExamAuthoringDraft;
  errors: ReturnType<typeof createEmptyDraftExamFormErrors>;
  lastSavedExam: DraftExamSummary | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
} = {
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
    draft: state.draft,
    errors: state.errors,
    lastSavedExam: state.lastSavedExam,
    status: state.status,
  });
  restoreFocus(focusSnapshot);
};

const resetFeedback = () => {
  state.errors = createEmptyDraftExamFormErrors();
  state.status = null;
};

const submitDraft = () => {
  const result = validateDraftExamAuthoringDraft(state.draft);

  if (!result.success) {
    state.errors = result.errors;
    state.status = {
      tone: "error",
      title: "Draft exam blocked",
      detail:
        "Fix the highlighted metadata and schedule issues before this draft exam can be saved.",
    };
    render();
    return;
  }

  state.errors = createEmptyDraftExamFormErrors();
  state.draft = normalizeDraftExamAuthoringDraft(state.draft, result.data);
  state.lastSavedExam = createDraftExamSummary(result.data);
  state.status = {
    tone: "success",
    title: "Draft exam saved",
    detail:
      "The exam metadata and schedule passed validation and the draft foundation is ready for later authoring steps.",
  };
  render();
};

root.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  const field = target.dataset.field as DraftExamFieldKey | undefined;

  if (!field) {
    return;
  }

  const focusSnapshot = captureFocus();

  state.draft = updateDraftExamField(state.draft, field, target.value);
  resetFeedback();
  render(focusSnapshot);
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

  switch (actionTrigger.dataset.action) {
    case "reset-draft":
      state.draft = structuredClone(state.baseDraft);
      state.errors = createEmptyDraftExamFormErrors();
      state.status = null;
      render();
      return;
    case "submit-draft":
      submitDraft();
      return;
    default:
      return;
  }
});

render();

if (query.get("submit") === "1") {
  submitDraft();
}
