import type { QuestionBankTopicOption } from "../../question-bank/question-bank.types.js";
import { renderQuestionBankShell } from "../../question-bank/ui/question-bank-shell.js";
import {
  escapeHtml,
  renderQuestionBankChip,
} from "../../question-bank/ui/question-bank-ui.shared.js";
import type {
  ObjectiveQuestionDraft,
  ObjectiveQuestionFormErrors,
  ObjectiveQuestionValues,
} from "../objective-question-form.js";
import {
  countObjectiveCorrectOptions,
  getObjectiveQuestionErrorSummary,
  OBJECTIVE_QUESTION_RULES,
  OBJECTIVE_QUESTION_TYPE_OPTIONS,
} from "../objective-question-form.js";
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_DIFFICULTY_OPTIONS,
  QUESTION_TYPE_LABELS,
} from "../../utils/question-metadata.js";

const renderErrorMessages = (messages?: string[]) => {
  if (!messages || messages.length === 0) {
    return "";
  }

  return `<ul class="objective-question-errors">${messages
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join("")}</ul>`;
};

const renderTypeSelector = (draft: ObjectiveQuestionDraft) => `
  <section class="question-bank-panel objective-question-panel">
    <div class="objective-question-panel__heading">
      <div>
        <p class="objective-question-panel__eyebrow">Question Type</p>
        <h2>Choose the objective format</h2>
      </div>
      <p class="objective-question-panel__helper">${escapeHtml(
        OBJECTIVE_QUESTION_RULES[draft.type],
      )}</p>
    </div>
    <div class="objective-question-type-grid" role="tablist" aria-label="Objective question types">
      ${OBJECTIVE_QUESTION_TYPE_OPTIONS.map(
        (option) => `
          <button
            class="objective-question-type-card${option.value === draft.type ? " is-active" : ""}"
            type="button"
            data-action="select-type"
            data-question-type="${option.value}"
            aria-pressed="${option.value === draft.type ? "true" : "false"}"
          >
            <span class="objective-question-type-card__label">${escapeHtml(
              option.label,
            )}</span>
            <span class="objective-question-type-card__rule">${escapeHtml(
              OBJECTIVE_QUESTION_RULES[option.value],
            )}</span>
          </button>
        `,
      ).join("")}
    </div>
  </section>
`;

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

const renderStatusBanner = ({
  errors,
  status,
}: {
  errors: ObjectiveQuestionFormErrors;
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
          ? `<ul>${getObjectiveQuestionErrorSummary(errors)
              .map((message) => `<li>${escapeHtml(message)}</li>`)
              .join("")}</ul>`
          : ""
      }
    </section>
  `;
};

const renderOptionEditor = ({
  draft,
  errors,
}: {
  draft: ObjectiveQuestionDraft;
  errors: ObjectiveQuestionFormErrors;
}) => {
  const correctInputType = draft.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio";
  const answerKeyHelper =
    draft.type === "MULTIPLE_CHOICE"
      ? "Select every correct answer."
      : "Select exactly one correct answer.";

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
              <article class="objective-question-option-row${option.isCorrect ? " is-correct" : ""}">
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
                ${draft.options.length >= 6 ? 'disabled="disabled"' : ""}
              >
                Add option
              </button>
              <p>${draft.options.length} of 6 options in use</p>
            </div>`
      }
    </section>
  `;
};

const renderLivePreview = ({
  draft,
  lastCreatedQuestion,
}: {
  draft: ObjectiveQuestionDraft;
  lastCreatedQuestion: ObjectiveQuestionValues | null;
}) => `
  <aside class="objective-question-sidebar">
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">Live Summary</p>
      <div class="objective-question-summary__chips">
        ${renderQuestionBankChip(QUESTION_TYPE_LABELS[draft.type], "type")}
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
          <dt>Options</dt>
          <dd>${draft.options.length}</dd>
        </div>
        <div>
          <dt>Correct answers</dt>
          <dd>${countObjectiveCorrectOptions(draft)}</dd>
        </div>
        <div>
          <dt>Review mode</dt>
          <dd>Auto graded</dd>
        </div>
      </dl>
      <section class="objective-question-summary__preview">
        <h3>${escapeHtml(draft.stem || "Question stem preview")}</h3>
        <ul>
          ${draft.options
            .map(
              (option) => `
                <li${option.isCorrect ? ' class="is-correct"' : ""}>
                  <span>${escapeHtml(option.label)}.</span>
                  <span>${escapeHtml(option.text || "Option text")}</span>
                </li>
              `,
            )
            .join("")}
        </ul>
      </section>
    </section>
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">Creation Rules</p>
      <ul class="objective-question-summary__rules">
        <li>${escapeHtml(OBJECTIVE_QUESTION_RULES[draft.type])}</li>
        <li>Option texts are required before the question can be created.</li>
        <li>Validation messages stay visible until the draft is corrected.</li>
      </ul>
    </section>
    <section class="question-bank-panel objective-question-summary">
      <p class="objective-question-panel__eyebrow">Last Created</p>
      ${
        lastCreatedQuestion
          ? `
              <h3>${escapeHtml(lastCreatedQuestion.stem)}</h3>
              <p>${escapeHtml(
                QUESTION_TYPE_LABELS[lastCreatedQuestion.type],
              )} · ${escapeHtml(
                QUESTION_DIFFICULTY_LABELS[lastCreatedQuestion.difficulty],
              )}</p>
              <p>Topic: ${escapeHtml(lastCreatedQuestion.topicId)}</p>
            `
          : `<p class="objective-question-summary__empty">Create a valid objective question to see the latest saved payload summary here.</p>`
      }
    </section>
  </aside>
`;

export const renderCreateObjectiveQuestionPage = ({
  draft,
  errors,
  lastCreatedQuestion,
  status,
  topics,
}: {
  draft: ObjectiveQuestionDraft;
  errors: ObjectiveQuestionFormErrors;
  lastCreatedQuestion: ObjectiveQuestionValues | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
  topics: QuestionBankTopicOption[];
}) =>
  renderQuestionBankShell({
    eyebrow: "Examiner Authoring",
    title: "Create Objective Question",
    description:
      "Author reusable single choice, multiple choice, and true or false questions with explicit answer keys and visible validation.",
    headerActions: `
      <a class="question-bank-button question-bank-button--secondary" href="./index.html">
        Back to bank
      </a>
    `,
    mainContent: `
      ${renderStatusBanner({ errors, status })}
      <section class="objective-question-layout">
        <div class="objective-question-main">
          ${renderTypeSelector(draft)}
          <section class="question-bank-panel objective-question-panel">
            <div class="objective-question-panel__heading">
              <div>
                <p class="objective-question-panel__eyebrow">Question Details</p>
                <h2>Set the prompt metadata</h2>
              </div>
              <p class="objective-question-panel__helper">Topic, difficulty, and explanation stay aligned to the shared authoring schema.</p>
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
          ${renderOptionEditor({ draft, errors })}
          <section class="question-bank-panel objective-question-actions">
            <div>
              <h2>Ready to validate this question?</h2>
              <p>Creation uses the same shared question schema as the rest of the authoring flow, so invalid configurations are blocked before they leave the form.</p>
            </div>
            <div class="objective-question-actions__buttons">
              <button
                class="question-bank-button question-bank-button--secondary"
                type="button"
                data-action="reset-draft"
              >
                Reset draft
              </button>
              <button
                class="question-bank-button"
                type="button"
                data-action="submit-draft"
              >
                Create question
              </button>
            </div>
          </section>
        </div>
        ${renderLivePreview({ draft, lastCreatedQuestion })}
      </section>
    `,
  });
