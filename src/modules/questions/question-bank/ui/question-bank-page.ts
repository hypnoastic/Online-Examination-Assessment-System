import {
  getQuestionBankEmptyStateCopy,
  getQuestionBankListingSummary,
} from "../question-bank-listing.js";
import type {
  QuestionBankEntry,
  QuestionBankFilters,
  QuestionBankTopicOption,
} from "../question-bank.types.js";
import { renderQuestionBankEmptyState } from "./question-bank-empty-state.js";
import { renderQuestionBankFilterToolbar } from "./question-bank-filter-toolbar.js";
import { renderQuestionBankRow } from "./question-bank-row.js";
import {
  escapeHtml,
  getQuestionDifficultyLabel,
  getQuestionReviewModeLabel,
  getQuestionTypeLabel,
  renderQuestionBankChip,
} from "./question-bank-ui.shared.js";
import { renderQuestionBankShell } from "./question-bank-shell.js";

const renderQuestionBankPreview = (entry: QuestionBankEntry | null) => {
  if (!entry) {
    return `
      <div class="question-bank-preview__empty">
        <h3>Nothing selected</h3>
        <p>Choose a question from the table to inspect its metadata, answer outline, and explanation.</p>
      </div>
    `;
  }

  return `
    <div class="question-bank-preview__header">
      <p class="question-bank-preview__eyebrow">${escapeHtml(entry.id)}</p>
      <h3>${escapeHtml(entry.stem)}</h3>
      <div class="question-bank-preview__chips">
        ${renderQuestionBankChip(getQuestionTypeLabel(entry), "type")}
        ${renderQuestionBankChip(
          getQuestionDifficultyLabel(entry),
          entry.difficulty.toLowerCase() as "easy" | "medium" | "hard",
        )}
        ${renderQuestionBankChip(entry.topicName, "topic")}
      </div>
    </div>
    <dl class="question-bank-preview__meta">
      <div>
        <dt>Review mode</dt>
        <dd>${escapeHtml(getQuestionReviewModeLabel(entry))}</dd>
      </div>
      <div>
        <dt>Usage</dt>
        <dd>${entry.usageCount} exam${entry.usageCount === 1 ? "" : "s"}</dd>
      </div>
    </dl>
    <section class="question-bank-preview__section">
      <h4>Expected answer</h4>
      <ul>
        ${entry.answerPreview
          .map(
            (answerLine) =>
              `<li>${escapeHtml(answerLine)}</li>`,
          )
          .join("")}
      </ul>
    </section>
    <section class="question-bank-preview__section">
      <h4>Explanation</h4>
      <p>${escapeHtml(entry.explanation)}</p>
    </section>
  `;
};

export const renderQuestionBankPage = ({
  allEntries,
  filters,
  selectedEntry,
  topics,
  visibleEntries,
}: {
  allEntries: QuestionBankEntry[];
  filters: QuestionBankFilters;
  selectedEntry: QuestionBankEntry | null;
  topics: QuestionBankTopicOption[];
  visibleEntries: QuestionBankEntry[];
}) => {
  const summary = getQuestionBankListingSummary(
    allEntries,
    visibleEntries,
    filters,
  );
  const emptyStateCopy = getQuestionBankEmptyStateCopy(filters);

  return renderQuestionBankShell({
    eyebrow: "Examiner Authoring",
    title: "Question Bank",
    description:
      "Search reusable assessment items, filter them by taxonomy, and scan row metadata before reusing them in an exam draft.",
    headerActions: `
      <a class="question-bank-button" href="./create.html">Create question</a>
    `,
    mainContent: `
      ${renderQuestionBankFilterToolbar({ filters, summary, topics })}
      <section class="question-bank-layout" aria-label="Question bank listing">
        <div class="question-bank-panel question-bank-table-panel">
          ${
            visibleEntries.length === 0
              ? renderQuestionBankEmptyState({
                  copy: emptyStateCopy,
                  hasActiveFilters: summary.hasActiveFilters,
                })
              : `
                  <div class="question-bank-table__scroll">
                    <table class="question-bank-table">
                      <thead>
                        <tr>
                          <th scope="col">Question</th>
                          <th scope="col">Type</th>
                          <th scope="col">Difficulty</th>
                          <th scope="col">Topic</th>
                          <th scope="col">Usage</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${visibleEntries
                          .map((entry) =>
                            renderQuestionBankRow({
                              entry,
                              isSelected: entry.id === selectedEntry?.id,
                            }),
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                `
          }
        </div>
        <aside class="question-bank-panel question-bank-preview" aria-label="Question preview">
          ${renderQuestionBankPreview(selectedEntry)}
        </aside>
      </section>
    `,
  });
};
