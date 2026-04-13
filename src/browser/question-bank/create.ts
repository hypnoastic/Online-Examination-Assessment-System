import {
  QUESTION_DIFFICULTIES,
  OBJECTIVE_QUESTION_TYPES,
  type ObjectiveQuestionType,
  type QuestionDifficulty,
} from "../../modules/questions/domain/question.types.js";
import { QUESTION_BANK_SAMPLE_ENTRIES } from "../../modules/questions/question-bank/question-bank.data.js";
import { getQuestionBankTopicOptions } from "../../modules/questions/question-bank/question-bank-listing.js";
import { renderCreateObjectiveQuestionPage } from "../../modules/questions/create-question/ui/create-objective-question-page.js";
import {
  addObjectiveQuestionOption,
  createEmptyObjectiveQuestionFormErrors,
  createObjectiveQuestionDraft,
  DEFAULT_OBJECTIVE_QUESTION_TYPE,
  removeObjectiveQuestionOption,
  updateObjectiveQuestionAnswerKey,
  updateObjectiveQuestionOptionText,
  validateObjectiveQuestionDraft,
  type ObjectiveQuestionDraft,
  type ObjectiveQuestionValues,
} from "../../modules/questions/create-question/objective-question-form.js";
import { OBJECTIVE_QUESTION_SCENARIOS } from "../../modules/questions/create-question/objective-question.scenarios.js";

const root = document.querySelector<HTMLElement>(
  "[data-create-objective-question-root]",
);

if (!root) {
  throw new Error("Objective question creation root element is missing.");
}

const topics = getQuestionBankTopicOptions(QUESTION_BANK_SAMPLE_ENTRIES);

const query = new URLSearchParams(window.location.search);

const isObjectiveQuestionType = (
  value: string | null,
): value is ObjectiveQuestionType =>
  value !== null &&
  OBJECTIVE_QUESTION_TYPES.includes(value as ObjectiveQuestionType);

const isQuestionDifficulty = (
  value: string | null,
): value is QuestionDifficulty =>
  value !== null && QUESTION_DIFFICULTIES.includes(value as QuestionDifficulty);

const getInitialObjectiveDraft = () => {
  const scenarioDraft = query.get("scenario");

  if (scenarioDraft && OBJECTIVE_QUESTION_SCENARIOS[scenarioDraft]) {
    return structuredClone(OBJECTIVE_QUESTION_SCENARIOS[scenarioDraft]);
  }

  const typeParam = query.get("type");
  const type = isObjectiveQuestionType(typeParam)
    ? typeParam
    : DEFAULT_OBJECTIVE_QUESTION_TYPE;
  const draft = createObjectiveQuestionDraft(type);
  const topicParam = query.get("topic");
  const difficultyParam = query.get("difficulty");
  const stemParam = query.get("stem");

  return {
    ...draft,
    topicId: topics.some((topic) => topic.id === topicParam) ? topicParam ?? "" : "",
    difficulty: isQuestionDifficulty(difficultyParam)
      ? difficultyParam
      : draft.difficulty,
    stem: stemParam?.trim() ?? "",
    explanation: query.get("explanation")?.trim() ?? "",
  };
};

const state: {
  draft: ObjectiveQuestionDraft;
  errors: ReturnType<typeof createEmptyObjectiveQuestionFormErrors>;
  lastCreatedQuestion: ObjectiveQuestionValues | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
} = {
  draft: getInitialObjectiveDraft(),
  errors: createEmptyObjectiveQuestionFormErrors(),
  lastCreatedQuestion: null,
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

const restoreFocus = (
  focusSnapshot: ReturnType<typeof captureFocus>,
) => {
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
  state.errors = createEmptyObjectiveQuestionFormErrors();
  state.status = null;
};

const render = (focusSnapshot: ReturnType<typeof captureFocus> = null) => {
  root.innerHTML = renderCreateObjectiveQuestionPage({
    draft: state.draft,
    errors: state.errors,
    lastCreatedQuestion: state.lastCreatedQuestion,
    status: state.status,
    topics,
  });
  restoreFocus(focusSnapshot);
};

const submitDraft = () => {
  const result = validateObjectiveQuestionDraft(state.draft);

  if (!result.success) {
    state.errors = result.errors;
    state.status = {
      tone: "error",
      title: "Question creation blocked",
      detail:
        "Fix the highlighted validation issues before the question can be created.",
    };
    render();
    return;
  }

  state.lastCreatedQuestion = result.data;
  state.errors = createEmptyObjectiveQuestionFormErrors();
  state.status = {
    tone: "success",
    title: "Objective question created",
    detail:
      "The draft passed schema validation and is ready to be stored by the authoring workflow.",
  };
  state.draft = {
    ...createObjectiveQuestionDraft(result.data.type),
    topicId: result.data.topicId,
    difficulty: result.data.difficulty,
  };
  render();
};

root.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  const focusSnapshot = captureFocus();

  if (target.dataset.field === "stem" || target.dataset.field === "explanation") {
    state.draft = {
      ...state.draft,
      [target.dataset.field]: target.value,
    };
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLInputElement &&
    typeof target.dataset.optionIndex === "string" &&
    target.dataset.optionField === "text"
  ) {
    state.draft = updateObjectiveQuestionOptionText(
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
    state.draft = {
      ...state.draft,
      topicId: target.value,
    };
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLSelectElement &&
    target.dataset.field === "difficulty" &&
    isQuestionDifficulty(target.value)
  ) {
    state.draft = {
      ...state.draft,
      difficulty: target.value,
    };
    resetFeedback();
    render(focusSnapshot);
    return;
  }

  if (
    target instanceof HTMLInputElement &&
    typeof target.dataset.optionIndex === "string" &&
    target.dataset.optionField === "isCorrect"
  ) {
    state.draft = updateObjectiveQuestionAnswerKey(
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

      if (!isObjectiveQuestionType(nextType)) {
        return;
      }

      state.draft = createObjectiveQuestionDraft(nextType, state.draft);
      resetFeedback();
      render(focusSnapshot);
      return;
    }
    case "add-option":
      state.draft = addObjectiveQuestionOption(state.draft);
      resetFeedback();
      render(focusSnapshot);
      return;
    case "remove-option":
      if (typeof actionTrigger.dataset.optionIndex !== "string") {
        return;
      }

      state.draft = removeObjectiveQuestionOption(
        state.draft,
        Number(actionTrigger.dataset.optionIndex),
      );
      resetFeedback();
      render(focusSnapshot);
      return;
    case "reset-draft":
      state.draft = createObjectiveQuestionDraft(state.draft.type);
      state.errors = createEmptyObjectiveQuestionFormErrors();
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
