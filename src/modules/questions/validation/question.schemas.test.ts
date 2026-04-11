import assert from "node:assert/strict";
import test from "node:test";

import {
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
} from "../domain/question.types";
import {
  createEmptyQuestionDraft,
  createTrueFalseOptionDrafts,
  getQuestionReviewMode,
  parseQuestionDraft,
} from "../utils/question-authoring";
import { questionAuthoringSchema } from "./question.schemas";

const baseDraft = {
  stem: "State the most appropriate answer for the given prompt.",
  difficulty: "MEDIUM" as const,
  topicId: "algebra",
  explanation: "Used for authoring validation coverage.",
};

test("question type and difficulty contracts match spec.md", () => {
  assert.deepEqual(QUESTION_TYPES, [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "SHORT_TEXT",
    "LONG_TEXT",
  ]);

  assert.deepEqual(QUESTION_DIFFICULTIES, ["EASY", "MEDIUM", "HARD"]);
});

test("authoring schema accepts every supported question type", () => {
  const acceptedPayloads = [
    {
      ...baseDraft,
      type: "SINGLE_CHOICE" as const,
      options: [
        { label: "A", text: "2", isCorrect: false, optionOrder: 1 },
        { label: "B", text: "4", isCorrect: true, optionOrder: 2 },
        { label: "C", text: "6", isCorrect: false, optionOrder: 3 },
        { label: "D", text: "8", isCorrect: false, optionOrder: 4 },
      ],
    },
    {
      ...baseDraft,
      type: "MULTIPLE_CHOICE" as const,
      options: [
        { label: "A", text: "HTTP", isCorrect: true, optionOrder: 1 },
        { label: "B", text: "TCP", isCorrect: true, optionOrder: 2 },
        { label: "C", text: "Binary tree", isCorrect: false, optionOrder: 3 },
        { label: "D", text: "DNS", isCorrect: false, optionOrder: 4 },
      ],
    },
    {
      ...baseDraft,
      type: "TRUE_FALSE" as const,
      options: createTrueFalseOptionDrafts(false),
    },
    {
      ...baseDraft,
      type: "SHORT_TEXT" as const,
      expectedAnswer: "OSI stands for Open Systems Interconnection.",
    },
    {
      ...baseDraft,
      type: "LONG_TEXT" as const,
      expectedAnswer:
        "A strong answer explains the algorithm, complexity, and tradeoffs.",
    },
  ];

  acceptedPayloads.forEach((payload) => {
    const parsed = questionAuthoringSchema.safeParse(payload);
    assert.equal(parsed.success, true);
  });
});

test("single-choice questions reject malformed answer keys", () => {
  const invalidQuestion = {
    ...baseDraft,
    type: "SINGLE_CHOICE" as const,
    options: [
      { label: "A", text: "2", isCorrect: true, optionOrder: 1 },
      { label: "B", text: "4", isCorrect: true, optionOrder: 2 },
    ],
  };

  const parsed = questionAuthoringSchema.safeParse(invalidQuestion);

  assert.equal(parsed.success, false);
});

test("multiple-choice questions require multiple correct options", () => {
  const invalidQuestion = {
    ...baseDraft,
    type: "MULTIPLE_CHOICE" as const,
    options: [
      { label: "A", text: "2", isCorrect: false, optionOrder: 1 },
      { label: "B", text: "4", isCorrect: true, optionOrder: 2 },
      { label: "C", text: "6", isCorrect: false, optionOrder: 3 },
    ],
  };

  const parsed = questionAuthoringSchema.safeParse(invalidQuestion);

  assert.equal(parsed.success, false);
});

test("true-false questions keep the fixed option contract", () => {
  const invalidQuestion = {
    ...baseDraft,
    type: "TRUE_FALSE" as const,
    options: [
      { label: "A", text: "Yes", isCorrect: true, optionOrder: 1 },
      { label: "B", text: "No", isCorrect: false, optionOrder: 2 },
    ],
  };

  const parsed = questionAuthoringSchema.safeParse(invalidQuestion);

  assert.equal(parsed.success, false);
});

test("duplicate objective option labels are rejected", () => {
  const invalidQuestion = {
    ...baseDraft,
    type: "SINGLE_CHOICE" as const,
    options: [
      { label: "A", text: "Option 1", isCorrect: false, optionOrder: 1 },
      { label: "A", text: "Option 2", isCorrect: true, optionOrder: 2 },
    ],
  };

  const parsed = questionAuthoringSchema.safeParse(invalidQuestion);

  assert.equal(parsed.success, false);
});

test("shared authoring helpers expose stable defaults", () => {
  const draft = createEmptyQuestionDraft("TRUE_FALSE");

  assert.deepEqual(
    draft.options.map((option) => option.text),
    ["True", "False"],
  );
  assert.equal(getQuestionReviewMode("LONG_TEXT"), "MANUAL");
  assert.equal(getQuestionReviewMode("SINGLE_CHOICE"), "OBJECTIVE");
});

test("parse helper normalizes option ordering before validation", () => {
  const parsed = parseQuestionDraft({
    ...baseDraft,
    type: "SINGLE_CHOICE",
    options: [
      { label: "B", text: "4", isCorrect: true, optionOrder: 2 },
      { label: "A", text: "2", isCorrect: false, optionOrder: 1 },
    ],
  });

  assert.deepEqual(
    parsed.options.map((option) => option.optionOrder),
    [1, 2],
  );
});
