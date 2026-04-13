import type {
  QuestionAuthoringDraft,
  QuestionDifficulty,
  QuestionReviewMode,
  QuestionType,
} from "../domain/question.types";

export const ALL_QUESTION_BANK_FILTER = "ALL" as const;

export type QuestionBankDifficultyFilter =
  | QuestionDifficulty
  | typeof ALL_QUESTION_BANK_FILTER;

export type QuestionBankTypeFilter =
  | QuestionType
  | typeof ALL_QUESTION_BANK_FILTER;

export type QuestionBankTopicFilter = string | typeof ALL_QUESTION_BANK_FILTER;

export interface QuestionBankEntry {
  id: string;
  stem: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  topicId: string;
  topicName: string;
  reviewMode: QuestionReviewMode;
  usageCount: number;
  updatedAt: string;
  answerPreview: string[];
  explanation: string;
  draft: QuestionAuthoringDraft;
}

export interface QuestionBankFilters {
  searchQuery: string;
  topicId: QuestionBankTopicFilter;
  difficulty: QuestionBankDifficultyFilter;
  type: QuestionBankTypeFilter;
}

export interface QuestionBankTopicOption {
  id: string;
  name: string;
  questionCount: number;
}

export interface QuestionBankListingSummary {
  totalCount: number;
  visibleCount: number;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export interface QuestionBankEmptyStateCopy {
  title: string;
  description: string;
}

export const createDefaultQuestionBankFilters = (): QuestionBankFilters => ({
  searchQuery: "",
  topicId: ALL_QUESTION_BANK_FILTER,
  difficulty: ALL_QUESTION_BANK_FILTER,
  type: ALL_QUESTION_BANK_FILTER,
});
