import assert from "node:assert/strict";
import test from "node:test";

import type { ObjectiveQuestionDraft } from "./objective-question-form.js";
import {
  addObjectiveQuestionOption,
  countObjectiveCorrectOptions,
  createObjectiveQuestionDraft,
  DEFAULT_OBJECTIVE_QUESTION_TYPE,
  removeObjectiveQuestionOption,
  updateObjectiveQuestionAnswerKey,
  updateObjectiveQuestionOptionText,
  validateObjectiveQuestionDraft,
} from "./objective-question-form.js";

const buildSingleChoiceDraft = (): ObjectiveQuestionDraft => {
  let draft = createObjectiveQuestionDraft(DEFAULT_OBJECTIVE_QUESTION_TYPE);

  draft = {
    ...draft,
    topicId: "algorithms",
    stem: "Which asymptotic bound describes the average-case search time in a balanced binary search tree?",
    explanation: "Balanced search trees provide logarithmic lookups.",
  };

  draft = updateObjectiveQuestionOptionText(draft, 0, "O(log n)");
  draft = updateObjectiveQuestionOptionText(draft, 1, "O(n)");
  draft = updateObjectiveQuestionOptionText(draft, 2, "O(n log n)");
  draft = updateObjectiveQuestionOptionText(draft, 3, "O(1)");

  return updateObjectiveQuestionAnswerKey(draft, 0, true);
};

test("switching objective types preserves shared draft fields", () => {
  const initialDraft = {
    ...buildSingleChoiceDraft(),
    difficulty: "HARD" as const,
  };
  const nextDraft = createObjectiveQuestionDraft("MULTIPLE_CHOICE", initialDraft);

  assert.equal(nextDraft.type, "MULTIPLE_CHOICE");
  assert.equal(nextDraft.stem, initialDraft.stem);
  assert.equal(nextDraft.topicId, initialDraft.topicId);
  assert.equal(nextDraft.difficulty, "HARD");
  assert.equal(nextDraft.options.length, 4);
});

test("option editing resequences labels and enforces the editable bounds", () => {
  let draft = buildSingleChoiceDraft();

  draft = addObjectiveQuestionOption(draft);
  draft = updateObjectiveQuestionOptionText(draft, 4, "O(n^2)");
  draft = removeObjectiveQuestionOption(draft, 1);

  assert.deepEqual(
    draft.options.map((option) => option.label),
    ["A", "B", "C", "D"],
  );
  assert.deepEqual(
    draft.options.map((option) => option.optionOrder),
    [1, 2, 3, 4],
  );

  const lockedTrueFalse = createObjectiveQuestionDraft("TRUE_FALSE");
  assert.equal(addObjectiveQuestionOption(lockedTrueFalse).options.length, 2);
});

test("single-choice validation blocks missing answer-key selection", () => {
  let draft = createObjectiveQuestionDraft("SINGLE_CHOICE");
  draft = {
    ...draft,
    topicId: "networks",
    stem: "Which protocol guarantees reliable, ordered delivery?",
  };
  draft = updateObjectiveQuestionOptionText(draft, 0, "UDP");
  draft = updateObjectiveQuestionOptionText(draft, 1, "TCP");
  draft = updateObjectiveQuestionOptionText(draft, 2, "IP");
  draft = updateObjectiveQuestionOptionText(draft, 3, "ARP");

  const result = validateObjectiveQuestionDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected validation failure");
  }

  assert.equal(
    result.errors.fields.options?.includes(
      "Single-choice questions must have exactly one correct option",
    ),
    true,
  );
});

test("multiple-choice validation accepts realistic correct answer sets", () => {
  let draft = createObjectiveQuestionDraft("MULTIPLE_CHOICE");
  draft = {
    ...draft,
    topicId: "networks",
    difficulty: "EASY",
    stem: "Select the packets exchanged during the TCP three-way handshake.",
  };
  draft = updateObjectiveQuestionOptionText(draft, 0, "SYN");
  draft = updateObjectiveQuestionOptionText(draft, 1, "SYN-ACK");
  draft = updateObjectiveQuestionOptionText(draft, 2, "ACK");
  draft = updateObjectiveQuestionOptionText(draft, 3, "RST");
  draft = updateObjectiveQuestionAnswerKey(draft, 0, true);
  draft = updateObjectiveQuestionAnswerKey(draft, 1, true);
  draft = updateObjectiveQuestionAnswerKey(draft, 2, true);

  const result = validateObjectiveQuestionDraft(draft);

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error("Expected valid multiple-choice draft");
  }

  assert.equal(result.data.type, "MULTIPLE_CHOICE");
  assert.equal(countObjectiveCorrectOptions(draft), 3);
});

test("true-false drafts keep fixed options and validate a single correct answer", () => {
  let draft = createObjectiveQuestionDraft("TRUE_FALSE");
  draft = {
    ...draft,
    topicId: "operating-systems",
    stem: "True or false: preventing any Coffman condition prevents deadlock.",
  };
  draft = updateObjectiveQuestionAnswerKey(draft, 0, true);

  const result = validateObjectiveQuestionDraft(draft);

  assert.equal(result.success, true);
  assert.deepEqual(
    draft.options.map((option) => option.text),
    ["True", "False"],
  );
});
