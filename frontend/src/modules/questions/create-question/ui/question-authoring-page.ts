import type { QuestionBankEntry, QuestionBankTopicOption } from "../../question-bank/question-bank.types";
import { renderQuestionBankShell } from "../../question-bank/ui/question-bank-shell";
import { renderQuestionDraftPreviewStructure } from "../../question-bank/ui/question-draft-preview";
import {
  escapeHtml,
  renderQuestionBankChip,
} from "../../question-bank/ui/question-bank-ui.shared";
import type {
  QuestionAuthoringFormErrors,
  QuestionFormDraft,
  QuestionFormValues,
} from "../question-authoring-form";
import {
  countQuestionDraftCorrectAnswers,
  getQuestionTypeLabel,
  getQuestionTypeRule,
} from "../question-authoring-form";
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  getQuestionReviewMode,
  isObjectiveQuestionDraft,
  isObjectiveQuestionType,
} from "../../utils/question-authoring";

const renderErrorMessages = (messages?: string[]) => {
  if (!messages || messages.length === 0) {
    return "";
  }

  return `<ul class="objective-question-errors">${messages
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join("")}</ul>`;
};

const renderTopicOptions = (
  topics: QuestionBankTopicOption[],
  selectedTopicId: string,
) =>
  topics
    .map(
      (topic) => `
        <option value="${escapeHtml(topic.id)}"${
          topic.id === selectedTopicId ? ' selected="selected"' : ""
        }>
          ${escapeHtml(topic.name)}
        </option>
      `,
    )
    .join("");

const renderTypeSelector = (draft: QuestionFormDraft) => `
  <section class="question-bank-panel objective-question-panel">
    <div class="objective-question-panel__heading">
      <div>
        <p class="objective-question-panel__eyebrow">Question Type</p>
        <h2>Choose the question format</h2>
      </div>
      <p class="objective-question-panel__helper">${escapeHtml(
        getQuestionTypeRule(draft.type),
      )}</p>
    </div>
    <div class="objective-question-type-grid" role="tablist" aria-label="Question types">
      ${QUESTION_TYPE_OPTIONS.map(
        (option) => `
          <button
            class="objective-question-type-card${
              option.value === draft.type ? " is-active" : ""
            }"
            type="button"
            data-action="select-type"
            data-question-type="${option.value}"
            aria-pressed="${option.value === draft.type ? "true" : "false"}"
          >
            <span class="objective-question-type-card__label">${escapeHtml(
              option.label,
            )}</span>
            <span class="objective-question-type-card__rule">${escapeHtml(
              getQuestionTypeRule(option.value),
            )}</span>
          </button>
        `,
      ).join("")}
    </div>
  </section>
`;

const renderStatusBanner = ({
  errors,
  status,
}: {
  errors: QuestionAuthoringFormErrors;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
}) => {
  if (!status) {
    return "";
  }

  return `
    <section class="question-bank-panel objective-question-status objective-question-status--${status.tone}" role="status" aria-live="polite">
      <div>
        <h2>${escapeHtml(status.title)}</h2>
        <p>${escapeHtml(status.detail)}</p>
      </div>
      ${
        status.tone === "error"
          ? `<ul>${errors.summary
              .map((message) => `<li>${escapeHtml(message)}</li>`)
              .join("")}</ul>`
          : ""
      }
    </section>
  `;
};

const renderQuestionDetails = ({
  draft,
  errors,
  topics,
}: {
  draft: QuestionFormDraft;
  errors: QuestionAuthoringFormErrors;
  topics: QuestionBankTopicOption[];
}) => `
  <section class="question-bank-panel objective-question-panel">
    <div class="objective-question-panel__heading">
      <div>
        <p class="objective-question-panel__eyebrow">Question Details</p>
        <h2>Set the prompt metadata</h2>
      </div>
      <p class="objective-question-panel__helper">Topic, difficulty, explanation, and response expectations stay aligned to the shared question schema.</p>
    </div>
    <div class="objective-question-fields">
      <label class="question-bank-field">
        <span class="question-bank-field__label">Topic</span>
        <select
          class="question-bank-field__control"
          data-focus-id="topicId"
          data-field="topicId"
        >
          <option value="">Select a topic</option>
          ${renderTopicOptions(topics, draft.topicId)}
        </select>
        ${renderErrorMessages(errors.fields.topicId)}
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Difficulty</span>
        <select
          class="question-bank-field__control"
          data-focus-id="difficulty"
          data-field="difficulty"
        >
          ${QUESTION_DIFFICULTY_OPTIONS.map(
            (option) => `
              <option value="${option.value}"${
                option.value === draft.difficulty ? ' selected="selected"' : ""
              }>
                ${escapeHtml(option.label)}
              </option>
            `,
          ).join("")}
        </select>
        ${renderErrorMessages(errors.fields.difficulty)}
      </label>
      <label class="question-bank-field objective-question-fields__full">
        <span class="question-bank-field__label">Question stem</span>
        <textarea
          class="question-bank-field__control objective-question-textarea"
          rows="5"
          placeholder="Write the full question prompt."
          data-focus-id="stem"
          data-field="stem"
        >${escapeHtml(draft.stem)}</textarea>
        ${renderErrorMessages(errors.fields.stem)}
      </label>
      <label class="question-bank-field objective-question-fields__full">
        <span class="question-bank-field__label">Explanation</span>
        <textarea
          class="question-bank-field__control objective-question-textarea"
          rows="4"
          placeholder="Add reviewer guidance or a short explanation."
          data-focus-id="explanation"
          data-field="explanation"
        >${escapeHtml(draft.explanation ?? "")}</textarea>
        ${renderErrorMessages(errors.fields.explanation)}
      </label>
    </div>
  </section>
`;

const renderObjectiveEditor = ({
  draft,
  errors,
}: {
  draft: QuestionFormDraft;
  errors: QuestionAuthoringFormErrors;
}) => {
  if (!isObjectiveQuestionDraft(draft)) {
    return "";
  }

  const correctInputType = draft.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio";
  const answerKeyHelper =
    draft.type === "MULTIPLE_CHOICE"
      ? "Select every correct answer."
      : "Select exactly one correct answer.";
  const isOptionLimitReached = draft.options.length >= 6;

  return `
    <section class="question-bank-panel objective-question-panel">
      <div class="objective-question-panel__heading">
        <div>
          <p class="objective-question-panel__eyebrow">Option Editor</p>
          <h2>Define the answer choices</h2>
        </div>
        <p class="objective-question-panel__helper">${escapeHtml(answerKeyHelper)}</p>
      </div>
      ${renderErrorMessages(errors.fields.options)}
      <div class="objective-question-option-list">
        ${draft.options
          .map((option, index) => {
            const optionErrors = errors.optionFields[index];

            return `
              <article class="objective-question-option-row${
                option.isCorrect ? " is-correct" : ""
              }">
                <div class="objective-question-option-row__key">
                  <span class="objective-question-option-row__label">${escapeHtml(
                    option.label,
                  )}</span>
                  <label class="objective-question-option-row__answer-key">
                    <input
                      type="${correctInputType}"
                      name="objective-answer-key"
                      data-focus-id="option-${index}-correct"
                      data-option-index="${index}"
                      data-option-field="isCorrect"
                      ${option.isCorrect ? ' checked="checked"' : ""}
                    />
                    <span>${draft.type === "MULTIPLE_CHOICE" ? "Correct" : "Answer key"}</span>
                  </label>
                </div>
                <div class="objective-question-option-row__body">
                  ${
                    draft.type === "TRUE_FALSE"
                      ? `<div class="objective-question-option-row__fixed">${escapeHtml(
                          option.text,
                        )}</div>`
                      : `<label class="question-bank-field">
                          <span class="question-bank-field__label">Option text</span>
                          <input
                            class="question-bank-field__control"
                            type="text"
                            value="${escapeHtml(option.text)}"
                            placeholder="Enter option ${escapeHtml(option.label)}"
                            data-focus-id="option-${index}-text"
                            data-option-index="${index}"
                            data-option-field="text"
                          />
                        </label>`
                  }
                  ${renderErrorMessages(optionErrors?.text)}
                  ${renderErrorMessages(optionErrors?.label)}
                  ${renderErrorMessages(optionErrors?.optionOrder)}
                </div>
                ${
                  draft.type === "TRUE_FALSE"
                    ? ""
                    : `<button
                        class="question-bank-button question-bank-button--secondary objective-question-option-row__remove"
                        type="button"
                        data-action="remove-option"
                        data-option-index="${index}"
                        ${draft.options.length <= 2 ? 'disabled="disabled"' : ""}
                      >
                        Remove
                      </button>`
                }
              </article>
            `;
          })
          .join("")}
      </div>
      ${
        draft.type === "TRUE_FALSE"
          ? ""
          : `<div class="objective-question-panel__footer">
              <button
                class="question-bank-button question-bank-button--secondary"
                type="button"
                data-action="add-option"
                ${isOptionLimitReached ? 'disabled="disabled"' : ""}
              >
                Add option
              </button>
              <p>${draft.options.length} of 6 options in use</p>
            </div>`
      }
    </section>
  `;
};

const renderSubjectiveEditor = ({
  draft,
  errors,
}: {
  draft: QuestionFormDraft;
  errors: QuestionAuthoringFormErrors;
}) => {
  if (isObjectiveQuestionDraft(draft)) {
    return "";
  }

  return `
    <section class="question-bank-panel objective-question-panel">
      <div class="objective-question-panel__heading">
        <div>
          <p class="objective-question-panel__eyebrow">Reviewer Reference</p>
          <h2>Define the expected answer</h2>
        </div>
        <p class="objective-question-panel__helper">This answer stays visible to graders and should describe the expected response structure clearly.</p>
      </div>
      <label class="question-bank-field">
        <span class="question-bank-field__label">${
          draft.type === "SHORT_TEXT" ? "Expected short answer" : "Model answer / rubric guidance"
        }</span>
        <textarea
          class="question-bank-field__control objective-question-textarea objective-question-textarea--answer"
          rows="${draft.type === "SHORT_TEXT" ? "5" : "8"}"
          placeholder="Describe the expected answer."
          data-focus-id="expectedAnswer"
          data-field="expectedAnswer"
        >${escapeHtml(draft.expectedAnswer)}</textarea>
        ${renderErrorMessages(errors.fields.expectedAnswer)}
      </label>
    </section>
  `;
};

const renderLivePreview = ({
  draft,
  lastSavedQuestion,
  mode,
  savedEntry,
}: {
  draft: QuestionFormDraft;
  lastSavedQuestion: QuestionFormValues | null;
  mode: "create" | "edit";
  savedEntry: QuestionBankEntry | null;
}) => `
  <aside class="objective-question-sidebar">
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">Live Preview</p>
      <div class="objective-question-summary__chips">
        ${renderQuestionBankChip(getQuestionTypeLabel(draft.type), "type")}
        ${renderQuestionBankChip(
          QUESTION_DIFFICULTY_LABELS[draft.difficulty],
          draft.difficulty.toLowerCase() as "easy" | "medium" | "hard",
        )}
      </div>
      <dl class="objective-question-summary__stats">
        <div>
          <dt>Topic</dt>
          <dd>${escapeHtml(draft.topicId || "Not selected")}</dd>
        </div>
        <div>
          <dt>Review mode</dt>
          <dd>${escapeHtml(getQuestionReviewMode(draft.type))}</dd>
        </div>
        <div>
          <dt>Correct answers</dt>
          <dd>${countQuestionDraftCorrectAnswers(draft)}</dd>
        </div>
        <div>
          <dt>Response style</dt>
          <dd>${escapeHtml(
            isObjectiveQuestionType(draft.type) ? "Objective" : "Subjective",
          )}</dd>
        </div>
      </dl>
      <section class="objective-question-summary__preview">
        <h3>${escapeHtml(draft.stem || "Question stem preview")}</h3>
        ${renderQuestionDraftPreviewStructure({
          draft,
          emptyAnswerLabel: "Expected answer preview",
          emptyOptionLabel: "Option text",
        })}
      </section>
    </section>
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">${
        mode === "edit" ? "Saved Record" : "Authoring Rules"
      }</p>
      ${
        mode === "edit" && savedEntry
          ? `
              <h3>${escapeHtml(savedEntry.id)}</h3>
              <p>Used in ${savedEntry.usageCount} exam${
              savedEntry.usageCount === 1 ? "" : "s"
            } · Updated ${escapeHtml(savedEntry.updatedAt.slice(0, 10))}</p>
              <div class="objective-question-summary__saved-structure">
                ${renderQuestionDraftPreviewStructure({
                  draft: savedEntry.draft,
                  emptyAnswerLabel: "Expected answer",
                  emptyOptionLabel: "Option text",
                })}
              </div>
            `
          : `<ul class="objective-question-summary__rules">
              <li>${escapeHtml(getQuestionTypeRule(draft.type))}</li>
              <li>Validation messages stay visible until the draft is corrected.</li>
              <li>Saved previews mirror the structure stored for reuse later.</li>
            </ul>`
      }
    </section>
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">${
        mode === "edit" ? "Last Saved" : "Last Created"
      }</p>
      ${
        lastSavedQuestion
          ? `
              <h3>${escapeHtml(lastSavedQuestion.stem)}</h3>
              <p>${escapeHtml(
                getQuestionTypeLabel(lastSavedQuestion.type),
              )} · ${escapeHtml(
                QUESTION_DIFFICULTY_LABELS[lastSavedQuestion.difficulty],
              )}</p>
              <p>Topic: ${escapeHtml(lastSavedQuestion.topicId)}</p>
            `
          : `<p class="objective-question-summary__empty">${
              mode === "edit"
                ? "Save the edited question to reflect the latest schema-valid structure here."
                : "Create a valid question to see the latest saved payload summary here."
            }</p>`
      }
    </section>
  </aside>
`;

export const renderQuestionAuthoringPage = ({
  draft,
  errors,
  lastSavedQuestion,
  mode,
  savedEntry,
  status,
  topics,
}: {
  draft: QuestionFormDraft;
  errors: QuestionAuthoringFormErrors;
  lastSavedQuestion: QuestionFormValues | null;
  mode: "create" | "edit";
  savedEntry: QuestionBankEntry | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
  topics: QuestionBankTopicOption[];
}) =>
  renderQuestionBankShell({
    eyebrow: "Examiner Authoring",
    title: mode === "edit" ? "Edit Question" : "Create Question",
    description:
      mode === "edit"
        ? "Update saved objective or subjective questions while keeping the reusable structure readable and validation-safe."
        : "Author reusable objective and subjective questions with saved previews, reviewer guidance, and schema-backed validation.",
    headerActions: `
      <a class="question-bank-button question-bank-button--secondary" href="./index.html${
        savedEntry ? `?selected=${encodeURIComponent(savedEntry.id)}` : ""
      }">
        Back to bank
      </a>
    `,
    mainContent: `
      ${renderStatusBanner({ errors, status })}
      <section class="objective-question-layout">
        <div class="objective-question-main">
          ${renderTypeSelector(draft)}
          ${renderQuestionDetails({ draft, errors, topics })}
          ${renderObjectiveEditor({ draft, errors })}
          ${renderSubjectiveEditor({ draft, errors })}
          <section class="question-bank-panel objective-question-actions">
            <div>
              <h2>${
                mode === "edit"
                  ? "Ready to save these edits?"
                  : "Ready to validate this question?"
              }</h2>
              <p>${
                mode === "edit"
                  ? "Saving keeps the reusable question schema intact across objective and subjective formats."
                  : "Creation uses the same shared question schema as the rest of the authoring flow, so invalid configurations are blocked before they leave the form."
              }</p>
            </div>
            <div class="objective-question-actions__buttons">
              <button
                class="question-bank-button question-bank-button--secondary"
                type="button"
                data-action="reset-draft"
              >
                ${mode === "edit" ? "Reset to saved" : "Reset draft"}
              </button>
              <button
                class="question-bank-button"
                type="button"
                data-action="submit-draft"
              >
                ${mode === "edit" ? "Save changes" : "Create question"}
              </button>
            </div>
          </section>
        </div>
        ${renderLivePreview({ draft, lastSavedQuestion, mode, savedEntry })}
      </section>
    `,
  });

export const renderQuestionAuthoringNotFoundPage = (questionId: string | null) =>
  renderQuestionBankShell({
    eyebrow: "Examiner Authoring",
    title: "Question not found",
    description:
      "The requested question could not be loaded for editing from the current sample bank.",
    headerActions: `
      <a class="question-bank-button question-bank-button--secondary" href="./index.html">
        Back to bank
      </a>
    `,
    mainContent: `
      <section class="question-bank-panel question-bank-empty-state">
        <div class="question-bank-empty-state__badge">?</div>
        <h3>No editable record for ${escapeHtml(questionId ?? "this id")}</h3>
        <p>Select another saved question from the bank preview and open its edit flow again.</p>
      </section>
    `,
  });
