import { OBJECTIVE_QUESTION_SCENARIOS } from "./objective-question.scenarios";
import type { QuestionFormDraft } from "./question-authoring-form";
import {
  createQuestionAuthoringDraft,
  updateQuestionDraftExpectedAnswer,
} from "./question-authoring-form";

const buildShortTextSuccessDraft = () => {
  let draft = createQuestionAuthoringDraft("SHORT_TEXT");
  draft = {
    ...draft,
    topicId: "operating-systems",
    difficulty: "MEDIUM",
    stem: "Explain the role of virtual memory in a multitasking operating system.",
    explanation:
      "A strong answer should mention process isolation, larger logical address spaces, and demand paging.",
  };
  return updateQuestionDraftExpectedAnswer(
    draft,
    "Virtual memory maps logical addresses to physical memory so processes can be isolated while using demand paging and larger address spaces than physical RAM alone allows.",
  );
};

const buildLongTextSuccessDraft = () => {
  let draft = createQuestionAuthoringDraft("LONG_TEXT");
  draft = {
    ...draft,
    topicId: "algorithms",
    difficulty: "HARD",
    stem: "Discuss the differences between breadth-first search and depth-first search, including one scenario where each is preferred.",
    explanation:
      "The model answer should compare traversal order, data structures, complexity, and fit for shortest paths versus backtracking.",
  };
  return updateQuestionDraftExpectedAnswer(
    draft,
    "Breadth-first search explores graph layers with a queue and is preferred for shortest paths in unweighted graphs, while depth-first search explores along a branch with a stack or recursion and is preferred for exhaustive traversal, cycle detection, and backtracking.",
  );
};

export const QUESTION_AUTHORING_SCENARIOS: Record<string, QuestionFormDraft> = {
  ...OBJECTIVE_QUESTION_SCENARIOS,
  "short-text-success": buildShortTextSuccessDraft(),
  "long-text-success": buildLongTextSuccessDraft(),
};
