import assert from "node:assert/strict";
import test from "node:test";

import { QUESTION_BANK_SAMPLE_ENTRIES } from "./question-bank.data";
import {
  filterQuestionBankEntries,
  getQuestionBankEmptyStateCopy,
  getQuestionBankListingSummary,
  getQuestionBankTopicOptions,
} from "./question-bank-listing";
import {
  ALL_QUESTION_BANK_FILTER,
  createDefaultQuestionBankFilters,
} from "./question-bank.types";

test("question bank topics are unique and sorted for filter controls", () => {
  const topics = getQuestionBankTopicOptions(QUESTION_BANK_SAMPLE_ENTRIES);

  assert.deepEqual(
    topics.map((topic) => topic.name),
    [
      "Algorithms",
      "Data Structures",
      "Database Systems",
      "Distributed Systems",
      "Networks",
      "Operating Systems",
      "Software Engineering",
    ],
  );
});

test("search matches realistic question stems regardless of casing", () => {
  const visibleEntries = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    {
      ...createDefaultQuestionBankFilters(),
      searchQuery: "QUICKSORT worst-case",
    },
  );

  assert.deepEqual(
    visibleEntries.map((entry) => entry.id),
    ["Q-204"],
  );
});

test("topic, difficulty, and question type filters work independently", () => {
  const algorithmsOnly = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    {
      ...createDefaultQuestionBankFilters(),
      topicId: "algorithms",
    },
  );
  const hardOnly = filterQuestionBankEntries(QUESTION_BANK_SAMPLE_ENTRIES, {
    ...createDefaultQuestionBankFilters(),
    difficulty: "HARD",
  });
  const longTextOnly = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    {
      ...createDefaultQuestionBankFilters(),
      type: "LONG_TEXT",
    },
  );

  assert.equal(algorithmsOnly.every((entry) => entry.topicId === "algorithms"), true);
  assert.equal(hardOnly.every((entry) => entry.difficulty === "HARD"), true);
  assert.deepEqual(
    longTextOnly.map((entry) => entry.id),
    ["Q-266"],
  );
});

test("filters combine cleanly across topic, difficulty, type, and search", () => {
  const visibleEntries = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    {
      searchQuery: "coffman conditions",
      topicId: "operating-systems",
      difficulty: "HARD",
      type: "TRUE_FALSE",
    },
  );

  assert.deepEqual(
    visibleEntries.map((entry) => entry.id),
    ["Q-241"],
  );
});

test("listing summary counts active filters and visible results", () => {
  const filters = {
    searchQuery: "distributed",
    topicId: ALL_QUESTION_BANK_FILTER,
    difficulty: "HARD" as const,
    type: "SHORT_TEXT" as const,
  };
  const visibleEntries = filterQuestionBankEntries(
    QUESTION_BANK_SAMPLE_ENTRIES,
    filters,
  );
  const summary = getQuestionBankListingSummary(
    QUESTION_BANK_SAMPLE_ENTRIES,
    visibleEntries,
    filters,
  );

  assert.equal(summary.totalCount, QUESTION_BANK_SAMPLE_ENTRIES.length);
  assert.equal(summary.visibleCount, 1);
  assert.equal(summary.activeFilterCount, 3);
  assert.equal(summary.hasActiveFilters, true);
});

test("empty-state copy stays clean for filtered and unfiltered zero-result cases", () => {
  const filteredCopy = getQuestionBankEmptyStateCopy({
    ...createDefaultQuestionBankFilters(),
    searchQuery: "nonexistent theorem",
  });
  const unfilteredCopy = getQuestionBankEmptyStateCopy(
    createDefaultQuestionBankFilters(),
  );

  assert.equal(filteredCopy.title, "No questions match these filters");
  assert.equal(unfilteredCopy.title, "No questions in the bank yet");
});
