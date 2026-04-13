import type { QuestionBankEmptyStateCopy } from "../question-bank.types";
import { escapeHtml } from "./question-bank-ui.shared";

export const renderQuestionBankEmptyState = ({
  copy,
  hasActiveFilters,
}: {
  copy: QuestionBankEmptyStateCopy;
  hasActiveFilters: boolean;
}) => `
  <div class="question-bank-empty-state" role="status" aria-live="polite">
    <div class="question-bank-empty-state__badge">0</div>
    <h3>${escapeHtml(copy.title)}</h3>
    <p>${escapeHtml(copy.description)}</p>
    ${
      hasActiveFilters
        ? `<button class="question-bank-button" type="button" data-action="clear-filters">Reset filters</button>`
        : ""
    }
  </div>
`;
