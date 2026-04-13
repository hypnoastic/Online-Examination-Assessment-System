import { formatQuestionBankDate } from "../question-bank-listing";
import type { QuestionBankEntry } from "../question-bank.types";
import {
  escapeHtml,
  getQuestionDifficultyLabel,
  getQuestionReviewModeLabel,
  getQuestionTypeLabel,
  renderQuestionBankChip,
} from "./question-bank-ui.shared";

export const renderQuestionBankRow = ({
  entry,
  isSelected,
}: {
  entry: QuestionBankEntry;
  isSelected: boolean;
}) => `
  <tr class="question-bank-row${isSelected ? " is-selected" : ""}">
    <td class="question-bank-row__question">
      <button
        class="question-bank-row__trigger"
        type="button"
        data-question-id="${escapeHtml(entry.id)}"
        aria-pressed="${isSelected ? "true" : "false"}"
      >
        <span class="question-bank-row__stem">${escapeHtml(entry.stem)}</span>
        <span class="question-bank-row__meta">
          <span>${escapeHtml(entry.id)}</span>
          <span>${escapeHtml(getQuestionReviewModeLabel(entry))}</span>
          <span>Updated ${escapeHtml(formatQuestionBankDate(entry.updatedAt))}</span>
        </span>
      </button>
    </td>
    <td>${renderQuestionBankChip(getQuestionTypeLabel(entry), "type")}</td>
    <td>${renderQuestionBankChip(
      getQuestionDifficultyLabel(entry),
      entry.difficulty.toLowerCase() as "easy" | "medium" | "hard",
    )}</td>
    <td>${renderQuestionBankChip(entry.topicName, "topic")}</td>
    <td class="question-bank-row__usage">${entry.usageCount} exam${entry.usageCount === 1 ? "" : "s"}</td>
  </tr>
`;
