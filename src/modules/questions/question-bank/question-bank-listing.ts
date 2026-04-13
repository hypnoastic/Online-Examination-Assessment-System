import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "../utils/question-metadata";
import type {
  QuestionBankEmptyStateCopy,
  QuestionBankEntry,
  QuestionBankFilters,
  QuestionBankListingSummary,
  QuestionBankTopicOption,
} from "./question-bank.types";
import { ALL_QUESTION_BANK_FILTER } from "./question-bank.types";

const normalizeSearchText = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, " ");

const buildQuestionBankSearchIndex = (entry: QuestionBankEntry) =>
  normalizeSearchText(
    [
      entry.id,
      entry.stem,
      entry.topicName,
      QUESTION_TYPE_LABELS[entry.type],
      QUESTION_DIFFICULTY_LABELS[entry.difficulty],
      entry.reviewMode,
    ].join(" "),
  );

export const hasQuestionBankFilters = (filters: QuestionBankFilters) =>
  filters.searchQuery.trim() !== "" ||
  filters.topicId !== ALL_QUESTION_BANK_FILTER ||
  filters.difficulty !== ALL_QUESTION_BANK_FILTER ||
  filters.type !== ALL_QUESTION_BANK_FILTER;

export const countActiveQuestionBankFilters = (
  filters: QuestionBankFilters,
) => {
  let count = 0;

  if (filters.searchQuery.trim() !== "") {
    count += 1;
  }

  if (filters.topicId !== ALL_QUESTION_BANK_FILTER) {
    count += 1;
  }

  if (filters.difficulty !== ALL_QUESTION_BANK_FILTER) {
    count += 1;
  }

  if (filters.type !== ALL_QUESTION_BANK_FILTER) {
    count += 1;
  }

  return count;
};

export const filterQuestionBankEntries = (
  entries: QuestionBankEntry[],
  filters: QuestionBankFilters,
) => {
  const normalizedSearch = normalizeSearchText(filters.searchQuery);
  const searchTokens =
    normalizedSearch === "" ? [] : normalizedSearch.split(" ");

  return entries.filter((entry) => {
    const searchIndex = buildQuestionBankSearchIndex(entry);
    const matchesSearch =
      searchTokens.length === 0 ||
      searchTokens.every((token) => searchIndex.includes(token));
    const matchesTopic =
      filters.topicId === ALL_QUESTION_BANK_FILTER ||
      entry.topicId === filters.topicId;
    const matchesDifficulty =
      filters.difficulty === ALL_QUESTION_BANK_FILTER ||
      entry.difficulty === filters.difficulty;
    const matchesType =
      filters.type === ALL_QUESTION_BANK_FILTER || entry.type === filters.type;

    return (
      matchesSearch && matchesTopic && matchesDifficulty && matchesType
    );
  });
};

export const getQuestionBankTopicOptions = (
  entries: QuestionBankEntry[],
): QuestionBankTopicOption[] => {
  const topicsById = new Map<string, QuestionBankTopicOption>();

  entries.forEach((entry) => {
    const existingTopic = topicsById.get(entry.topicId);

    if (existingTopic) {
      existingTopic.questionCount += 1;
      return;
    }

    topicsById.set(entry.topicId, {
      id: entry.topicId,
      name: entry.topicName,
      questionCount: 1,
    });
  });

  return [...topicsById.values()].sort((left: QuestionBankTopicOption, right: QuestionBankTopicOption) =>
    left.name.localeCompare(right.name),
  );
};

export const getQuestionBankListingSummary = (
  entries: QuestionBankEntry[],
  visibleEntries: QuestionBankEntry[],
  filters: QuestionBankFilters,
): QuestionBankListingSummary => ({
  totalCount: entries.length,
  visibleCount: visibleEntries.length,
  hasActiveFilters: hasQuestionBankFilters(filters),
  activeFilterCount: countActiveQuestionBankFilters(filters),
});

export const getQuestionBankEmptyStateCopy = (
  filters: QuestionBankFilters,
): QuestionBankEmptyStateCopy => {
  if (!hasQuestionBankFilters(filters)) {
    return {
      title: "No questions in the bank yet",
      description:
        "This listing is ready for reusable assessment items, but the bank is currently empty.",
    };
  }

  return {
    title: "No questions match these filters",
    description:
      "Try widening the topic, difficulty, or question type filters, or clear the search to restore the full bank.",
  };
};

export const formatQuestionBankDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));

export const getQuestionBankSelection = (
  entries: QuestionBankEntry[],
  selectedQuestionId: string | null,
) =>
  entries.find((entry) => entry.id === selectedQuestionId) ?? entries[0] ?? null;
