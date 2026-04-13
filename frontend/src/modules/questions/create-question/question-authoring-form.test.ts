import assert from "node:assert/strict";
import test from "node:test";

import {
  QUESTION_BANK_SAMPLE_ENTRIES,
  createQuestionBankEntry,
  getQuestionBankEntryById,
} from "../question-bank/question-bank.data";
import {
  createQuestionAuthoringDraft,
  getQuestionAuthoringPreviewLines,
  updateQuestionDraftAnswerKey,
  updateQuestionDraftExpectedAnswer,
  updateQuestionDraftOptionText,
  validateQuestionAuthoringDraft,
} from "./question-authoring-form";

test("short-text and long-text drafts validate with expected answers", () => {
  const shortTextDraft = updateQuestionDraftExpectedAnswer(
    {
      ...createQuestionAuthoringDraft("SHORT_TEXT"),
      topicId: "operating-systems",
      stem: "Explain virtual memory in one short paragraph.",
    },
    "Virtual memory abstracts physical memory, supports isolation, and enables demand paging.",
  );
  const longTextDraft = updateQuestionDraftExpectedAnswer(
    {
      ...createQuestionAuthoringDraft("LONG_TEXT"),
      topicId: "algorithms",
      difficulty: "HARD",
      stem: "Compare breadth-first search and depth-first search with realistic use cases.",
    },
    "Breadth-first search explores level by level for shortest paths in unweighted graphs, while depth-first search follows branches deeply for exhaustive traversal and backtracking.",
  );

  assert.equal(validateQuestionAuthoringDraft(shortTextDraft).success, true);
  assert.equal(validateQuestionAuthoringDraft(longTextDraft).success, true);
});

test("switching within subjective types preserves the reviewer answer draft", () => {
  const shortTextDraft = updateQuestionDraftExpectedAnswer(
    {
      ...createQuestionAuthoringDraft("SHORT_TEXT"),
      topicId: "distributed-systems",
      stem: "Explain the CAP theorem briefly.",
    },
    "During a partition, distributed systems trade consistency against availability while partition tolerance remains necessary.",
  );

  const longTextDraft = createQuestionAuthoringDraft("LONG_TEXT", shortTextDraft);

  if (shortTextDraft.type !== "SHORT_TEXT") {
    throw new Error("Expected a short-text draft");
  }

  assert.equal(longTextDraft.expectedAnswer, shortTextDraft.expectedAnswer);
  assert.equal(longTextDraft.topicId, "distributed-systems");
});

test("saved bank entries stay schema-valid for edit mode across subjective and objective types", () => {
  QUESTION_BANK_SAMPLE_ENTRIES.forEach((entry) => {
    const result = validateQuestionAuthoringDraft(entry.draft);
    assert.equal(result.success, true, `Expected ${entry.id} to stay valid`);
  });
});

test("preview lines are derived from the saved question structure", () => {
  const objectiveEntry = getQuestionBankEntryById("Q-204");
  const subjectiveEntry = getQuestionBankEntryById("Q-238");

  if (!objectiveEntry || !subjectiveEntry) {
    throw new Error("Expected seeded sample entries");
  }

  const objectivePreview = getQuestionAuthoringPreviewLines(objectiveEntry.draft);
  const subjectivePreview = getQuestionAuthoringPreviewLines(subjectiveEntry.draft);

  assert.deepEqual(objectivePreview[0], {
    kind: "option",
    label: "A",
    text: "O(n^2)",
    isCorrect: true,
  });
  assert.deepEqual(subjectivePreview, [
    {
      kind: "answer",
      text:
        "Virtual memory creates an abstraction of large contiguous memory and enables isolation plus efficient memory utilization.",
    },
  ]);
});

test("question bank entry previews are generated from the saved authoring payload", () => {
  const draft = updateQuestionDraftAnswerKey(
    updateQuestionDraftOptionText(
      updateQuestionDraftOptionText(
        updateQuestionDraftOptionText(
          updateQuestionDraftOptionText(
            {
              ...createQuestionAuthoringDraft("SINGLE_CHOICE"),
              topicId: "networks",
              difficulty: "EASY",
              stem: "Which protocol guarantees ordered, reliable delivery?",
              explanation: "TCP guarantees ordered reliable delivery.",
            },
            0,
            "TCP",
          ),
          1,
          "UDP",
        ),
        2,
        "IP",
      ),
      3,
      "ICMP",
    ),
    0,
    true,
  );
  const entry = createQuestionBankEntry({
    id: "Q-999",
    topicName: "Networks",
    usageCount: 1,
    updatedAt: "2026-04-13T10:00:00.000Z",
    draft,
  });

  assert.deepEqual(entry.answerPreview, ["TCP"]);
  assert.equal(entry.reviewMode, "OBJECTIVE");
});
