import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "../../utils/question-metadata";
import type { QuestionBankEntry } from "../question-bank.types";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const REVIEW_MODE_LABELS = {
  OBJECTIVE: "Auto graded",
  MANUAL: "Manual review",
} as const;

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

export const getQuestionTypeLabel = (entry: QuestionBankEntry) =>
  QUESTION_TYPE_LABELS[entry.type];

export const getQuestionDifficultyLabel = (entry: QuestionBankEntry) =>
  QUESTION_DIFFICULTY_LABELS[entry.difficulty];

export const getQuestionReviewModeLabel = (entry: QuestionBankEntry) =>
  REVIEW_MODE_LABELS[entry.reviewMode];

export const renderQuestionBankChip = (
  label: string,
  tone: "topic" | "type" | "easy" | "medium" | "hard" | "review",
) =>
  `<span class="question-bank-chip question-bank-chip--${tone}">${escapeHtml(
    label,
  )}</span>`;
