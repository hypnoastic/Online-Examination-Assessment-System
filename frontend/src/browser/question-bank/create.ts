import {
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
  type QuestionDifficulty,
  type QuestionType,
} from "../../modules/questions/domain/question.types";
import {
  QUESTION_BANK_SAMPLE_ENTRIES,
  createQuestionBankEntry,
  getQuestionBankEntryById,
} from "../../modules/questions/question-bank/question-bank.data";
import { getQuestionBankTopicOptions } from "../../modules/questions/question-bank/question-bank-listing";
import {
  renderQuestionAuthoringNotFoundPage,
  renderQuestionAuthoringPage,
} from "../../modules/questions/create-question/ui/question-authoring-page";
import {
  addQuestionDraftOption,
  createEmptyQuestionAuthoringFormErrors,
  createQuestionAuthoringDraft,
  type QuestionFormDraft,
  type QuestionFormValues,
  removeQuestionDraftOption,
  updateQuestionDraftAnswerKey,
  updateQuestionDraftDifficulty,
  updateQuestionDraftExpectedAnswer,
  updateQuestionDraftOptionText,
  updateQuestionDraftTextField,
  updateQuestionDraftTopic,
  validateQuestionAuthoringDraft,
} from "../../modules/questions/create-question/question-authoring-form";
import { QUESTION_AUTHORING_SCENARIOS } from "../../modules/questions/create-question/question-authoring.scenarios";

const root = document.querySelector<HTMLElement>("[data-question-authoring-root]");

if (!root) {
  throw new Error("Question authoring root element is missing.");
}

const topics = getQuestionBankTopicOptions(QUESTION_BANK_SAMPLE_ENTRIES);
const query = new URLSearchParams(window.location.search);
const mode = root.dataset.mode === "edit" ? "edit" : "create";

const isQuestionType = (value: string | null): value is QuestionType =>
  value !== null && QUESTION_TYPES.includes(value as QuestionType);

const isQuestionDifficulty = (
  value: string | null,
): value is QuestionDifficulty =>
  value !== null && QUESTION_DIFFICULTIES.includes(value as QuestionDifficulty);

const getEditingEntry = () => {
  if (mode !== "edit") {
    return null;
  }

  const questionId = query.get("id");
  return questionId ? getQuestionBankEntryById(questionId) : null;
};

const editingEntry = getEditingEntry();

const getDraftWithQueryOverrides = (draft: QuestionFormDraft) => {
  let nextDraft = draft;
  const topicParam = query.get("topic");
  const difficultyParam = query.get("difficulty");
  const stemParam = query.get("stem");
  const explanationParam = query.get("explanation");
  const expectedAnswerParam = query.get("expectedAnswer");

  if (topics.some((topic) => topic.id === topicParam)) {
    nextDraft = updateQuestionDraftTopic(nextDraft, topicParam ?? "");
  }

  if (isQuestionDifficulty(difficultyParam)) {
    nextDraft = updateQuestionDraftDifficulty(nextDraft, difficultyParam);
  }

  if (stemParam?.trim()) {
    nextDraft = updateQuestionDraftTextField(nextDraft, "stem", stemParam.trim());
  }

  if (explanationParam !== null) {
    nextDraft = updateQuestionDraftTextField(
      nextDraft,
      "explanation",
      explanationParam,
    );
  }

  if (expectedAnswerParam !== null) {
    nextDraft = updateQuestionDraftExpectedAnswer(nextDraft, expectedAnswerParam);
  }

  return nextDraft;
};

const getInitialDraft = () => {
  if (editingEntry) {
    return getDraftWithQueryOverrides(structuredClone(editingEntry.draft));
  }

  const scenarioDraft = query.get("scenario");

  if (scenarioDraft && QUESTION_AUTHORING_SCENARIOS[scenarioDraft]) {
    return getDraftWithQueryOverrides(
      structuredClone(QUESTION_AUTHORING_SCENARIOS[scenarioDraft]),
    );
  }

  const typeParam = query.get("type");
  const draft = createQuestionAuthoringDraft(
    isQuestionType(typeParam) ? typeParam : "SINGLE_CHOICE",
  );

  return getDraftWithQueryOverrides(draft);
};

const initialDraft = getInitialDraft();

const state: {
  draft: QuestionFormDraft;
  baseDraft: QuestionFormDraft;
  errors: ReturnType<typeof createEmptyQuestionAuthoringFormErrors>;
  lastSavedQuestion: QuestionFormValues | null;
  savedEntry: typeof editingEntry;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
} = {
  draft: structuredClone(initialDraft),
  baseDraft: structuredClone(initialDraft),
  errors: createEmptyQuestionAuthoringFormErrors(),
  lastSavedQuestion: null,
  savedEntry: editingEntry,
  status: null,
};

type FocusableField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null;

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

const resetFeedback = () => {
  state.errors = createEmptyQuestionAuthoringFormErrors();
  state.status = null;
};

const render = (focusSnapshot: ReturnType<typeof captureFocus> = null) => {
  if (mode === "edit" && !state.savedEntry) {
    root.innerHTML = renderQuestionAuthoringNotFoundPage(query.get("id"));
    return;
  }

  root.innerHTML = renderQuestionAuthoringPage({
    draft: state.draft,
    errors: state.errors,
    lastSavedQuestion: state.lastSavedQuestion,
    mode,
    savedEntry: state.savedEntry,
    status: state.status,
    topics,
  });
  restoreFocus(focusSnapshot);
};

const submitDraft = () => {
  if (mode === "edit" && !state.savedEntry) {
    render();
    return;
  }

  const result = validateQuestionAuthoringDraft(state.draft);

  if (!result.success) {
    state.errors = result.errors;
    state.status = {
      tone: "error",
      title: mode === "edit" ? "Question update blocked" : "Question creation blocked",
      detail:
        mode === "edit"
          ? "Fix the highlighted validation issues before these edits can be saved."
          : "Fix the highlighted validation issues before the question can be created.",
    };
    render();
    return;
  }

  state.lastSavedQuestion = result.data;
  state.errors = createEmptyQuestionAuthoringFormErrors();

  if (mode === "edit" && state.savedEntry) {
    state.savedEntry = createQuestionBankEntry({
      id: state.savedEntry.id,
      topicName:
        topics.find((topic) => topic.id === result.data.topicId)?.name ??
        state.savedEntry.topicName,
      usageCount: state.savedEntry.usageCount,
      updatedAt: state.savedEntry.updatedAt,
      draft: structuredClone(result.data),
    });
    state.baseDraft = structuredClone(result.data);
    state.draft = structuredClone(result.data);
    state.status = {
      tone: "success",
      title: "Question updated",
      detail:
        "The edited question passed schema validation and the saved preview now reflects the updated structure.",
    };
    render();
    return;
  }

  state.status = {
    tone: "success",
    title: "Question created",
    detail:
      "The draft passed schema validation and is ready to be stored by the authoring workflow.",
  };
  state.baseDraft = createQuestionAuthoringDraft(result.data.type, {
    topicId: result.data.topicId,
    difficulty: result.data.difficulty,
  });
  state.draft = structuredClone(state.baseDraft);
  render();
};

root.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  const focusSnapshot = captureFocus();

  if (target.dataset.field === "stem" || target.dataset.field === "explanation") {
    state.draft = updateQuestionDraftTextField(
      state.draft,
      target.dataset.field,
      target.value,
    );
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (target.dataset.field === "expectedAnswer") {
    state.draft = updateQuestionDraftExpectedAnswer(state.draft, target.value);
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLInputElement &&
    typeof target.dataset.optionIndex === "string" &&
    target.dataset.optionField === "text"
  ) {
    state.draft = updateQuestionDraftOptionText(
      state.draft,
      Number(target.dataset.optionIndex),
      target.value,
    );
    resetFeedback();
    render(focusSnapshot);
  }
});

root.addEventListener("change", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
    return;
  }

  const focusSnapshot = captureFocus();

  if (target instanceof HTMLSelectElement && target.dataset.field === "topicId") {
    state.draft = updateQuestionDraftTopic(state.draft, target.value);
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLSelectElement &&
    target.dataset.field === "difficulty" &&
    isQuestionDifficulty(target.value)
  ) {
    state.draft = updateQuestionDraftDifficulty(state.draft, target.value);
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLInputElement &&
    typeof target.dataset.optionIndex === "string" &&
    target.dataset.optionField === "isCorrect"
  ) {
    state.draft = updateQuestionDraftAnswerKey(
      state.draft,
      Number(target.dataset.optionIndex),
      target.checked,
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

  switch (actionTrigger.dataset.action) {
    case "select-type": {
      const nextType = actionTrigger.dataset.questionType ?? null;

      if (!isQuestionType(nextType)) {
        return;
      }

      state.draft = createQuestionAuthoringDraft(nextType, state.draft);
      resetFeedback();
      render(focusSnapshot);
      return;
    }
    case "add-option":
      state.draft = addQuestionDraftOption(state.draft);
      resetFeedback();
      render(focusSnapshot);
      return;
    case "remove-option":
      if (typeof actionTrigger.dataset.optionIndex !== "string") {
        return;
      }

      state.draft = removeQuestionDraftOption(
        state.draft,
        Number(actionTrigger.dataset.optionIndex),
      );
      resetFeedback();
      render(focusSnapshot);
      return;
    case "reset-draft":
      state.draft = structuredClone(state.baseDraft);
      state.errors = createEmptyQuestionAuthoringFormErrors();
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
