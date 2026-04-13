import { QUESTION_BANK_SAMPLE_ENTRIES } from "../../modules/questions/question-bank/question-bank.data";
import {
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
} from "../../modules/questions/domain/question.types";
import {
  filterQuestionBankEntries,
  getQuestionBankSelection,
  getQuestionBankTopicOptions,
} from "../../modules/questions/question-bank/question-bank-listing";
import {
  ALL_QUESTION_BANK_FILTER,
  createDefaultQuestionBankFilters,
  type QuestionBankDifficultyFilter,
  type QuestionBankTypeFilter,
  type QuestionBankTopicFilter,
} from "../../modules/questions/question-bank/question-bank.types";
import { renderQuestionBankPage } from "../../modules/questions/question-bank/ui/question-bank-page";

const root = document.querySelector<HTMLElement>("[data-question-bank-root]");

if (!root) {
  throw new Error("Question bank root element is missing.");
}

const topics = getQuestionBankTopicOptions(QUESTION_BANK_SAMPLE_ENTRIES);

const getSearchParamValue = (key: string) => {
  const value = new URLSearchParams(window.location.search).get(key);
  return value?.trim() ?? "";
};

const getInitialFilters = () => {
  const topicParam = getSearchParamValue("topic");
  const difficultyParam = getSearchParamValue("difficulty");
  const typeParam = getSearchParamValue("type");

  return {
    searchQuery: getSearchParamValue("search"),
    topicId: topics.some((topic) => topic.id === topicParam)
      ? topicParam
      : ALL_QUESTION_BANK_FILTER,
    difficulty: QUESTION_DIFFICULTIES.includes(
      difficultyParam as (typeof QUESTION_DIFFICULTIES)[number],
    )
      ? (difficultyParam as QuestionBankDifficultyFilter)
      : ALL_QUESTION_BANK_FILTER,
    type: QUESTION_TYPES.includes(typeParam as (typeof QUESTION_TYPES)[number])
      ? (typeParam as QuestionBankTypeFilter)
      : ALL_QUESTION_BANK_FILTER,
  };
};

const state: {
  filters: ReturnType<typeof getInitialFilters>;
  selectedQuestionId: string | null;
} = {
  filters: getInitialFilters(),
  selectedQuestionId:
    getSearchParamValue("selected") || QUESTION_BANK_SAMPLE_ENTRIES[0]?.id || null,
};

const render = () => {
  const visibleEntries = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    state.filters,
  );
  const selectedEntry = getQuestionBankSelection(
    visibleEntries,
    state.selectedQuestionId,
  );

  state.selectedQuestionId = selectedEntry?.id ?? null;
  root.innerHTML = renderQuestionBankPage({
    allEntries: QUESTION_BANK_SAMPLE_ENTRIES,
    filters: state.filters,
    selectedEntry,
    topics,
    visibleEntries,
  });
};

root.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.dataset.role !== "question-bank-search") {
    return;
  }

  state.filters = {
    ...state.filters,
    searchQuery: target.value,
  };
  render();
});

root.addEventListener("change", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLSelectElement)) {
    return;
  }

  switch (target.dataset.role) {
    case "question-bank-topic-filter":
      state.filters = {
        ...state.filters,
        topicId:
          (target.value || ALL_QUESTION_BANK_FILTER) as QuestionBankTopicFilter,
      };
      break;
    case "question-bank-difficulty-filter":
      state.filters = {
        ...state.filters,
        difficulty:
          (target.value ||
            ALL_QUESTION_BANK_FILTER) as QuestionBankDifficultyFilter,
      };
      break;
    case "question-bank-type-filter":
      state.filters = {
        ...state.filters,
        type:
          (target.value || ALL_QUESTION_BANK_FILTER) as QuestionBankTypeFilter,
      };
      break;
    default:
      return;
  }

  render();
});

root.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const clearFiltersTrigger = target.closest<HTMLElement>(
    "[data-action='clear-filters']",
  );

  if (clearFiltersTrigger) {
    state.filters = createDefaultQuestionBankFilters();
    render();
    return;
  }

  const questionTrigger = target.closest<HTMLElement>("[data-question-id]");

  if (!questionTrigger) {
    return;
  }

  state.selectedQuestionId = questionTrigger.dataset.questionId ?? null;
  render();
});

render();
