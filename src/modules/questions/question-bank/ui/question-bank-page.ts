import {
  formatQuestionBankDate,
  getQuestionBankEmptyStateCopy,
  getQuestionBankListingSummary,
} from "../question-bank-listing";
import type {
  QuestionBankEntry,
  QuestionBankFilters,
  QuestionBankTopicOption,
} from "../question-bank.types";
import { renderQuestionBankEmptyState } from "./question-bank-empty-state";
import { renderQuestionBankFilterToolbar } from "./question-bank-filter-toolbar";
import { renderQuestionDraftPreviewStructure } from "./question-draft-preview";
import { renderQuestionBankRow } from "./question-bank-row";
import {
  escapeHtml,
  getQuestionDifficultyLabel,
  getQuestionReviewModeLabel,
  getQuestionTypeLabel,
  renderQuestionBankChip,
} from "./question-bank-ui.shared";
import { renderQuestionBankShell } from "./question-bank-shell";

const renderQuestionBankPreview = (entry: QuestionBankEntry | null) => {
  if (!entry) {
    return `
      <div class="question-bank-preview__empty">
        <h3>Nothing selected</h3>
        <p>Choose a question from the table to inspect its saved structure, reviewer guidance, and edit path.</p>
      </div>
    `;
  }

  const createSimilarParams = new URLSearchParams({
    difficulty: entry.difficulty,
    topic: entry.topicId,
    type: entry.type,
  }).toString();
  const explanationClass = entry.explanation
    ? ""
    : ' class="question-bank-preview__empty-copy"';

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
    <div class="question-bank-preview__actions">
      <a class="question-bank-button" href="./edit.html?id=${encodeURIComponent(
        entry.id,
      )}">Edit question</a>
      <a class="question-bank-button question-bank-button--secondary" href="./create.html?${createSimilarParams}">Create similar</a>
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
      <div>
        <dt>Updated</dt>
        <dd>${escapeHtml(formatQuestionBankDate(entry.updatedAt))}</dd>
      </div>
      <div>
        <dt>Response style</dt>
        <dd>${escapeHtml(entry.reviewMode === "MANUAL" ? "Subjective" : "Objective")}</dd>
      </div>
    </dl>
    <section class="question-bank-preview__section">
      <h4>Saved structure</h4>
      <div class="question-bank-preview__structure">
        ${renderQuestionDraftPreviewStructure({
          draft: entry.draft,
          emptyAnswerLabel: "Expected answer",
          emptyOptionLabel: "Option text",
        })}
      </div>
    </section>
    <section class="question-bank-preview__section">
      <h4>Explanation</h4>
      <p${explanationClass}>${escapeHtml(
        entry.explanation || "No explanation saved for this reusable question yet.",
      )}</p>
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
      "Search reusable assessment items, filter them by taxonomy, preview their saved structure, and move directly into editing when the question needs refinement.",
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
