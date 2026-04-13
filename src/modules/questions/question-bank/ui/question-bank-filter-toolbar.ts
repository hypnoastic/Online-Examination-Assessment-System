import {
  QUESTION_DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from "../../utils/question-metadata";
import type {
  QuestionBankFilters,
  QuestionBankListingSummary,
  QuestionBankTopicOption,
} from "../question-bank.types";
import { ALL_QUESTION_BANK_FILTER } from "../question-bank.types";
import { escapeHtml } from "./question-bank-ui.shared";

const renderSelectedOption = (value: string, selectedValue: string) =>
  value === selectedValue ? ' selected="selected"' : "";

const renderTopicOptions = (
  topics: QuestionBankTopicOption[],
  selectedTopicId: string,
) =>
  topics
    .map(
      (topic) =>
        `<option value="${escapeHtml(topic.id)}"${renderSelectedOption(
          topic.id,
          selectedTopicId,
        )}>${escapeHtml(topic.name)} (${topic.questionCount})</option>`,
    )
    .join("");

const renderDifficultyOptions = (selectedDifficulty: string) =>
  QUESTION_DIFFICULTY_OPTIONS.map(
    (option) =>
      `<option value="${option.value}"${renderSelectedOption(
        option.value,
        selectedDifficulty,
      )}>${option.label}</option>`,
  ).join("");

const renderTypeOptions = (selectedType: string) =>
  QUESTION_TYPE_OPTIONS.map(
    (option) =>
      `<option value="${option.value}"${renderSelectedOption(
        option.value,
        selectedType,
      )}>${option.label}</option>`,
  ).join("");

export const renderQuestionBankFilterToolbar = ({
  filters,
  summary,
  topics,
}: {
  filters: QuestionBankFilters;
  summary: QuestionBankListingSummary;
  topics: QuestionBankTopicOption[];
}) => `
  <section class="question-bank-panel question-bank-toolbar" aria-label="Question bank filters">
    <div class="question-bank-toolbar__controls">
      <label class="question-bank-field question-bank-field--search">
        <span class="question-bank-field__label">Search</span>
        <input
          class="question-bank-field__control"
          type="search"
          placeholder="Search question stems..."
          value="${escapeHtml(filters.searchQuery)}"
          data-role="question-bank-search"
        />
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Topic</span>
        <select class="question-bank-field__control" data-role="question-bank-topic-filter">
          <option value="${ALL_QUESTION_BANK_FILTER}">All Topics</option>
          ${renderTopicOptions(topics, String(filters.topicId))}
        </select>
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Difficulty</span>
        <select class="question-bank-field__control" data-role="question-bank-difficulty-filter">
          <option value="${ALL_QUESTION_BANK_FILTER}">All Difficulties</option>
          ${renderDifficultyOptions(String(filters.difficulty))}
        </select>
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Type</span>
        <select class="question-bank-field__control" data-role="question-bank-type-filter">
          <option value="${ALL_QUESTION_BANK_FILTER}">All Types</option>
          ${renderTypeOptions(String(filters.type))}
        </select>
      </label>
      <button
        class="question-bank-button question-bank-button--secondary"
        type="button"
        data-action="clear-filters"
        ${summary.hasActiveFilters ? "" : 'disabled="disabled"'}
      >
        Clear filters
      </button>
    </div>
    <div class="question-bank-toolbar__summary">
      <p>
        <strong>${summary.visibleCount}</strong> of ${summary.totalCount} questions visible
      </p>
      <p>
        ${summary.hasActiveFilters ? `${summary.activeFilterCount} active filter${summary.activeFilterCount === 1 ? "" : "s"}` : "Browsing the full reusable bank"}
      </p>
    </div>
  </section>
`;
