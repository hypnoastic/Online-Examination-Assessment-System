import type { QuestionAuthoringDraft } from "../domain/question.types";
import {
  getQuestionReviewMode,
  isObjectiveQuestionDraft,
} from "../utils/question-metadata";
import type { QuestionBankEntry } from "./question-bank.types";

const getQuestionAnswerPreview = (draft: QuestionAuthoringDraft) => {
  if (isObjectiveQuestionDraft(draft)) {
    return draft.options
      .filter((option) => option.isCorrect)
      .map((option) => option.text);
  }

  return [draft.expectedAnswer];
};

export const createQuestionBankEntry = ({
  draft,
  id,
  topicName,
  updatedAt,
  usageCount,
}: {
  draft: QuestionAuthoringDraft;
  id: string;
  topicName: string;
  updatedAt: string;
  usageCount: number;
}): QuestionBankEntry => ({
  id,
  stem: draft.stem,
  type: draft.type,
  difficulty: draft.difficulty,
  topicId: draft.topicId,
  topicName,
  reviewMode: getQuestionReviewMode(draft.type),
  usageCount,
  updatedAt,
  answerPreview: getQuestionAnswerPreview(draft),
  explanation: draft.explanation ?? "",
  draft,
});

export const QUESTION_BANK_SAMPLE_ENTRIES: QuestionBankEntry[] = [
  createQuestionBankEntry({
    id: "Q-204",
    topicName: "Algorithms",
    usageCount: 3,
    updatedAt: "2026-04-09T10:30:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "What is the worst-case time complexity of quicksort when the pivot repeatedly splits the array unevenly?",
      difficulty: "HARD",
      topicId: "algorithms",
      explanation:
        "The worst case occurs when partitioning is highly unbalanced, producing quadratic work across recursive calls.",
      options: [
        { label: "A", text: "O(n^2)", isCorrect: true, optionOrder: 1 },
        { label: "B", text: "O(n log n)", isCorrect: false, optionOrder: 2 },
        { label: "C", text: "O(log n)", isCorrect: false, optionOrder: 3 },
        { label: "D", text: "O(n)", isCorrect: false, optionOrder: 4 },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-219",
    topicName: "Data Structures",
    usageCount: 5,
    updatedAt: "2026-04-11T08:05:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "Which traversal of a binary search tree lists the keys in sorted order?",
      difficulty: "EASY",
      topicId: "data-structures",
      explanation:
        "In-order traversal visits left subtree, node, and right subtree, which yields ascending keys in a BST.",
      options: [
        {
          label: "A",
          text: "In-order traversal",
          isCorrect: true,
          optionOrder: 1,
        },
        {
          label: "B",
          text: "Pre-order traversal",
          isCorrect: false,
          optionOrder: 2,
        },
        {
          label: "C",
          text: "Post-order traversal",
          isCorrect: false,
          optionOrder: 3,
        },
        {
          label: "D",
          text: "Level-order traversal",
          isCorrect: false,
          optionOrder: 4,
        },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-225",
    topicName: "Data Structures",
    usageCount: 2,
    updatedAt: "2026-04-08T14:20:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "Which property is always true for a binary search tree node relative to its left and right subtrees?",
      difficulty: "MEDIUM",
      topicId: "data-structures",
      explanation:
        "The BST ordering invariant compares every key in each subtree against the current node, not only the immediate children.",
      options: [
        {
          label: "A",
          text: "All left subtree keys are smaller and all right subtree keys are larger",
          isCorrect: true,
          optionOrder: 1,
        },
        {
          label: "B",
          text: "Every node has exactly two children",
          isCorrect: false,
          optionOrder: 2,
        },
        {
          label: "C",
          text: "The root is always the median key",
          isCorrect: false,
          optionOrder: 3,
        },
        {
          label: "D",
          text: "Leaves must appear on the same level",
          isCorrect: false,
          optionOrder: 4,
        },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-238",
    topicName: "Operating Systems",
    usageCount: 4,
    updatedAt: "2026-04-10T06:45:00.000Z",
    draft: {
      type: "SHORT_TEXT",
      stem: "Explain the role of virtual memory and describe two benefits it gives to a multitasking operating system.",
      difficulty: "MEDIUM",
      topicId: "operating-systems",
      explanation:
        "A strong response should mention logical-to-physical mapping and benefits such as process isolation, demand paging, or larger address spaces.",
      expectedAnswer:
        "Virtual memory creates an abstraction of large contiguous memory and enables isolation plus efficient memory utilization.",
    },
  }),
  createQuestionBankEntry({
    id: "Q-241",
    topicName: "Operating Systems",
    usageCount: 2,
    updatedAt: "2026-04-07T12:15:00.000Z",
    draft: {
      type: "TRUE_FALSE",
      stem: "True or false: A system cannot enter deadlock if at least one of the Coffman conditions is permanently prevented.",
      difficulty: "HARD",
      topicId: "operating-systems",
      explanation:
        "Deadlock requires all Coffman conditions to hold simultaneously, so violating any one of them prevents deadlock.",
      options: [
        { label: "A", text: "True", isCorrect: true, optionOrder: 1 },
        { label: "B", text: "False", isCorrect: false, optionOrder: 2 },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-248",
    topicName: "Networks",
    usageCount: 3,
    updatedAt: "2026-04-10T17:40:00.000Z",
    draft: {
      type: "MULTIPLE_CHOICE",
      stem: "Which steps are part of the TCP three-way handshake used to establish a reliable connection?",
      difficulty: "EASY",
      topicId: "networks",
      explanation:
        "The exchange synchronizes sequence numbers and confirms both endpoints are ready to transmit.",
      options: [
        {
          label: "A",
          text: "Client sends SYN",
          isCorrect: true,
          optionOrder: 1,
        },
        {
          label: "B",
          text: "Server replies with SYN-ACK",
          isCorrect: true,
          optionOrder: 2,
        },
        {
          label: "C",
          text: "Client sends ACK",
          isCorrect: true,
          optionOrder: 3,
        },
        {
          label: "D",
          text: "Server sends FIN",
          isCorrect: false,
          optionOrder: 4,
        },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-252",
    topicName: "Networks",
    usageCount: 6,
    updatedAt: "2026-04-06T09:50:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "Which network protocol guarantees ordered and reliable byte-stream delivery between hosts?",
      difficulty: "EASY",
      topicId: "networks",
      explanation:
        "TCP adds sequencing, acknowledgements, and retransmission to deliver a reliable ordered stream.",
      options: [
        { label: "A", text: "TCP", isCorrect: true, optionOrder: 1 },
        { label: "B", text: "UDP", isCorrect: false, optionOrder: 2 },
        { label: "C", text: "IP", isCorrect: false, optionOrder: 3 },
        { label: "D", text: "ARP", isCorrect: false, optionOrder: 4 },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-261",
    topicName: "Database Systems",
    usageCount: 4,
    updatedAt: "2026-04-09T05:25:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "Which normal form removes transitive dependencies from a relation after it already satisfies second normal form?",
      difficulty: "MEDIUM",
      topicId: "database-systems",
      explanation:
        "Third normal form targets non-key attributes that depend transitively on a candidate key.",
      options: [
        { label: "A", text: "First Normal Form", isCorrect: false, optionOrder: 1 },
        { label: "B", text: "Second Normal Form", isCorrect: false, optionOrder: 2 },
        { label: "C", text: "Third Normal Form", isCorrect: true, optionOrder: 3 },
        { label: "D", text: "Boyce-Codd Normal Form", isCorrect: false, optionOrder: 4 },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-266",
    topicName: "Algorithms",
    usageCount: 1,
    updatedAt: "2026-04-12T07:15:00.000Z",
    draft: {
      type: "LONG_TEXT",
      stem: "Discuss the differences between breadth-first search and depth-first search, including one scenario where each is preferred.",
      difficulty: "HARD",
      topicId: "algorithms",
      explanation:
        "A high-quality answer should compare traversal order, data structures, complexity, and practical use cases.",
      expectedAnswer:
        "Breadth-first search explores level by level and is preferred for shortest paths in unweighted graphs, while depth-first search is preferred for exhaustive traversal and backtracking.",
    },
  }),
  createQuestionBankEntry({
    id: "Q-274",
    topicName: "Software Engineering",
    usageCount: 2,
    updatedAt: "2026-04-08T16:55:00.000Z",
    draft: {
      type: "MULTIPLE_CHOICE",
      stem: "Select the constraints that are part of RESTful architectural style for web services.",
      difficulty: "MEDIUM",
      topicId: "software-engineering",
      explanation:
        "REST emphasizes a set of architectural constraints rather than a specific protocol or serialization format.",
      options: [
        { label: "A", text: "Client-server", isCorrect: true, optionOrder: 1 },
        { label: "B", text: "Statelessness", isCorrect: true, optionOrder: 2 },
        { label: "C", text: "Cacheability", isCorrect: true, optionOrder: 3 },
        { label: "D", text: "Uniform interface", isCorrect: true, optionOrder: 4 },
      ],
    },
  }),
  createQuestionBankEntry({
    id: "Q-281",
    topicName: "Distributed Systems",
    usageCount: 1,
    updatedAt: "2026-04-11T13:35:00.000Z",
    draft: {
      type: "SHORT_TEXT",
      stem: "Explain the CAP theorem and state which tradeoff a distributed data store makes during a network partition.",
      difficulty: "HARD",
      topicId: "distributed-systems",
      explanation:
        "The response should note that partition tolerance is unavoidable once partitions occur, forcing a consistency-availability tradeoff.",
      expectedAnswer:
        "During a partition, the system must choose between consistency and availability while partition tolerance remains mandatory.",
    },
  }),
  createQuestionBankEntry({
    id: "Q-288",
    topicName: "Algorithms",
    usageCount: 3,
    updatedAt: "2026-04-05T11:05:00.000Z",
    draft: {
      type: "SINGLE_CHOICE",
      stem: "When does Dijkstra's algorithm fail to produce correct shortest paths in a weighted graph?",
      difficulty: "MEDIUM",
      topicId: "algorithms",
      explanation:
        "Dijkstra assumes once a node is finalized its current path cost is optimal, which breaks with negative-weight edges.",
      options: [
        {
          label: "A",
          text: "When negative edge weights are present",
          isCorrect: true,
          optionOrder: 1,
        },
        {
          label: "B",
          text: "When the graph is disconnected",
          isCorrect: false,
          optionOrder: 2,
        },
        {
          label: "C",
          text: "When the graph is directed",
          isCorrect: false,
          optionOrder: 3,
        },
        {
          label: "D",
          text: "When the graph contains cycles",
          isCorrect: false,
          optionOrder: 4,
        },
      ],
    },
  }),
];

export const getQuestionBankEntryById = (id: string) =>
  QUESTION_BANK_SAMPLE_ENTRIES.find((entry) => entry.id === id) ?? null;
