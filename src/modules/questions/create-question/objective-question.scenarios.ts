import type { ObjectiveQuestionDraft } from "./objective-question-form.js";
import {
  createObjectiveQuestionDraft,
  updateObjectiveQuestionAnswerKey,
  updateObjectiveQuestionOptionText,
} from "./objective-question-form.js";

const buildSingleChoiceSuccessDraft = () => {
  let draft = createObjectiveQuestionDraft("SINGLE_CHOICE");
  draft = {
    ...draft,
    topicId: "algorithms",
    difficulty: "MEDIUM",
    stem: "Which traversal of a binary search tree lists keys in sorted order?",
    explanation:
      "In-order traversal visits the left subtree, node, and right subtree in ascending order for a BST.",
  };
  draft = updateObjectiveQuestionOptionText(draft, 0, "In-order traversal");
  draft = updateObjectiveQuestionOptionText(draft, 1, "Pre-order traversal");
  draft = updateObjectiveQuestionOptionText(draft, 2, "Post-order traversal");
  draft = updateObjectiveQuestionOptionText(draft, 3, "Level-order traversal");
  return updateObjectiveQuestionAnswerKey(draft, 0, true);
};

const buildMultipleChoiceSuccessDraft = () => {
  let draft = createObjectiveQuestionDraft("MULTIPLE_CHOICE");
  draft = {
    ...draft,
    topicId: "networks",
    difficulty: "EASY",
    stem: "Select the packets exchanged during the TCP three-way handshake.",
    explanation:
      "A TCP connection is established by synchronizing both endpoints with SYN, SYN-ACK, and ACK.",
  };
  draft = updateObjectiveQuestionOptionText(draft, 0, "Client sends SYN");
  draft = updateObjectiveQuestionOptionText(draft, 1, "Server replies with SYN-ACK");
  draft = updateObjectiveQuestionOptionText(draft, 2, "Client sends ACK");
  draft = updateObjectiveQuestionOptionText(draft, 3, "Server sends FIN");
  draft = updateObjectiveQuestionAnswerKey(draft, 0, true);
  draft = updateObjectiveQuestionAnswerKey(draft, 1, true);
  return updateObjectiveQuestionAnswerKey(draft, 2, true);
};

const buildTrueFalseSuccessDraft = () => {
  let draft = createObjectiveQuestionDraft("TRUE_FALSE");
  draft = {
    ...draft,
    topicId: "operating-systems",
    difficulty: "HARD",
    stem: "True or false: preventing any Coffman condition from holding can prevent deadlock.",
    explanation:
      "Deadlock requires all Coffman conditions to hold simultaneously, so blocking any one of them prevents the system from deadlocking.",
  };
  return updateObjectiveQuestionAnswerKey(draft, 0, true);
};

const buildInvalidSingleChoiceDraft = () => {
  let draft = createObjectiveQuestionDraft("SINGLE_CHOICE");
  draft = {
    ...draft,
    topicId: "data-structures",
    difficulty: "EASY",
    stem: "Which structure always removes the most recently added element first?",
    explanation: "The correct answer should identify stack behavior.",
  };
  draft = updateObjectiveQuestionOptionText(draft, 0, "Queue");
  draft = updateObjectiveQuestionOptionText(draft, 1, "Stack");
  draft = updateObjectiveQuestionOptionText(draft, 2, "Heap");
  draft = updateObjectiveQuestionOptionText(draft, 3, "Graph");
  return draft;
};

export const OBJECTIVE_QUESTION_SCENARIOS: Record<string, ObjectiveQuestionDraft> =
  {
    "single-choice-success": buildSingleChoiceSuccessDraft(),
    "multiple-choice-success": buildMultipleChoiceSuccessDraft(),
    "true-false-success": buildTrueFalseSuccessDraft(),
    "invalid-single-choice": buildInvalidSingleChoiceDraft(),
  };
