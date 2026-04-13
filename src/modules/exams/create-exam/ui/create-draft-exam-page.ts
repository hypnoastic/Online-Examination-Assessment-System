import { escapeHtml } from "../../../questions/question-bank/ui/question-bank-ui.shared";
import type { DraftExamSummary } from "../../domain/exam.types";
import type {
  DraftExamAuthoringDraft,
  DraftExamAuthoringFormErrors,
} from "../exam-authoring-form";
import {
  formatDraftExamDateTime,
  getDraftExamWindowDurationMinutes,
  parseDraftExamInstructions,
} from "../exam-authoring-form";

const renderErrorMessages = (messages?: string[]) => {
  if (!messages || messages.length === 0) {
    return "";
  }

  return `<ul class="exam-authoring-errors">${messages
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join("")}</ul>`;
};

const renderExamAuthoringShell = ({
  description,
  headerActions = "",
  mainContent,
  title,
}: {
  description: string;
  headerActions?: string;
  mainContent: string;
  title: string;
}) => `
  <div class="question-bank-shell">
    <aside class="question-bank-shell__sidebar" aria-label="Examiner navigation">
      <div class="question-bank-brand">
        <span class="question-bank-brand__mark">OE</span>
        <div>
          <p>Online Examination</p>
          <p>Assessment System</p>
        </div>
      </div>
      <nav class="question-bank-nav">
        <a href="#" class="question-bank-nav__item">Dashboard</a>
        <a href="./create.html" class="question-bank-nav__item is-active" aria-current="page">Exams</a>
        <a href="../question-bank/index.html" class="question-bank-nav__item">Question Bank</a>
        <a href="#" class="question-bank-nav__item">Review Queue</a>
        <a href="#" class="question-bank-nav__item">Analytics</a>
      </nav>
      <div class="question-bank-sidebar__footer">
        <p>Exam draft workspace</p>
        <p>Metadata and schedule basics stay validated here before sections or assignments are added.</p>
      </div>
    </aside>
    <main class="question-bank-shell__main">
      <header class="question-bank-page-header">
        <div class="question-bank-page-header__top">
          <div class="question-bank-page-header__copy">
            <p class="question-bank-page-header__eyebrow">Examiner Authoring</p>
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(description)}</p>
          </div>
          ${
            headerActions === ""
              ? ""
              : `<div class="question-bank-page-header__actions">${headerActions}</div>`
          }
        </div>
      </header>
      ${mainContent}
    </main>
  </div>
`;

const formatDraftInputDateTime = (value: string) => {
  if (value.trim() === "") {
    return "Not scheduled";
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "Invalid date"
    : formatDraftExamDateTime(parsed);
};

const getDraftWindowMinutes = (draft: DraftExamAuthoringDraft) => {
  if (draft.windowStartsAt.trim() === "" || draft.windowEndsAt.trim() === "") {
    return null;
  }

  const start = new Date(draft.windowStartsAt);
  const end = new Date(draft.windowEndsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.round((end.getTime() - start.getTime()) / (60 * 1000));
};

const getDraftWindowLengthLabel = (draftWindowMinutes: number | null) => {
  if (draftWindowMinutes === null) {
    return "Set both schedule fields";
  }

  if (draftWindowMinutes < 0) {
    return "Window closes before it opens";
  }

  return `${draftWindowMinutes} minutes`;
};

const renderStatusBanner = ({
  errors,
  status,
}: {
  errors: DraftExamAuthoringFormErrors;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
}) => {
  if (!status) {
    return "";
  }

  return `
    <section class="question-bank-panel exam-authoring-status exam-authoring-status--${status.tone}" role="status" aria-live="polite">
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

const renderMetadataPanel = ({
  draft,
  errors,
}: {
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
}) => `
  <section class="question-bank-panel exam-authoring-panel">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Metadata</p>
        <h2>Set the draft identity</h2>
      </div>
      <p class="exam-authoring-panel__helper">Title, code, and duration establish the draft exam contract used by later authoring steps.</p>
    </div>
    <div class="exam-authoring-fields">
      <label class="question-bank-field exam-authoring-fields__wide">
        <span class="question-bank-field__label">Exam title</span>
        <input
          class="question-bank-field__control"
          type="text"
          value="${escapeHtml(draft.title)}"
          placeholder="e.g. Database Systems Midterm"
          data-focus-id="title"
          data-field="title"
        />
        ${renderErrorMessages(errors.fields.title)}
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Exam code</span>
        <input
          class="question-bank-field__control exam-authoring-field--mono"
          type="text"
          value="${escapeHtml(draft.code)}"
          placeholder="e.g. DBMS-301"
          data-focus-id="code"
          data-field="code"
        />
        ${renderErrorMessages(errors.fields.code)}
      </label>
      <label class="question-bank-field">
        <span class="question-bank-field__label">Duration</span>
        <div class="exam-authoring-field-with-suffix">
          <input
            class="question-bank-field__control"
            type="number"
            min="1"
            step="1"
            value="${escapeHtml(draft.durationMinutes)}"
            placeholder="90"
            data-focus-id="durationMinutes"
            data-field="durationMinutes"
          />
          <span>minutes</span>
        </div>
        ${renderErrorMessages(errors.fields.durationMinutes)}
      </label>
    </div>
  </section>
`;

const renderSchedulePanel = ({
  draft,
  errors,
}: {
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
}) => {
  const draftWindowMinutes = getDraftWindowMinutes(draft);

  return `
    <section class="question-bank-panel exam-authoring-panel">
      <div class="exam-authoring-panel__heading">
        <div>
          <p class="exam-authoring-panel__eyebrow">Schedule</p>
          <h2>Define the exam window</h2>
        </div>
        <p class="exam-authoring-panel__helper">The scheduled window must open before it closes, and the exam duration must fit inside that range.</p>
      </div>
      <div class="exam-authoring-fields">
        <label class="question-bank-field">
          <span class="question-bank-field__label">Window opens</span>
          <input
            class="question-bank-field__control"
            type="datetime-local"
            value="${escapeHtml(draft.windowStartsAt)}"
            data-focus-id="windowStartsAt"
            data-field="windowStartsAt"
          />
          ${renderErrorMessages(errors.fields.windowStartsAt)}
        </label>
        <label class="question-bank-field">
          <span class="question-bank-field__label">Window closes</span>
          <input
            class="question-bank-field__control"
            type="datetime-local"
            value="${escapeHtml(draft.windowEndsAt)}"
            data-focus-id="windowEndsAt"
            data-field="windowEndsAt"
          />
          ${renderErrorMessages(errors.fields.windowEndsAt)}
        </label>
      </div>
      <div class="exam-authoring-panel__note">
        <p>Current window length</p>
        <strong>${getDraftWindowLengthLabel(draftWindowMinutes)}</strong>
      </div>
    </section>
  `;
};

const renderInstructionsPanel = ({
  draft,
  errors,
}: {
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
}) => `
  <section class="question-bank-panel exam-authoring-panel">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Instructions</p>
        <h2>Write the student-facing guidance</h2>
      </div>
      <p class="exam-authoring-panel__helper">Use one clear instruction per line so the saved draft can carry stable attempt guidance later.</p>
    </div>
    <label class="question-bank-field">
      <span class="question-bank-field__label">Exam instructions</span>
      <textarea
        class="question-bank-field__control exam-authoring-textarea"
        rows="8"
        placeholder="Read every question carefully before answering."
        data-focus-id="instructionsText"
        data-field="instructionsText"
      >${escapeHtml(draft.instructionsText)}</textarea>
      ${renderErrorMessages(errors.fields.instructionsText)}
    </label>
  </section>
`;

const renderActionPanel = () => `
  <section class="question-bank-panel exam-authoring-actions">
    <div>
      <h2>Ready to save this draft?</h2>
      <p>Saving here only validates and stores the exam metadata foundation. Sections, question mapping, and assignments can build on this in later steps.</p>
    </div>
    <div class="exam-authoring-actions__buttons">
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
        Save draft exam
      </button>
    </div>
  </section>
`;

const renderLiveSummary = ({
  draft,
  lastSavedExam,
}: {
  draft: DraftExamAuthoringDraft;
  lastSavedExam: DraftExamSummary | null;
}) => {
  const instructions = parseDraftExamInstructions(draft.instructionsText);
  const draftWindowMinutes = getDraftWindowMinutes(draft);

  return `
    <aside class="exam-authoring-sidebar">
      <section class="question-bank-panel exam-authoring-summary">
        <p class="exam-authoring-panel__eyebrow">Live Summary</p>
        <div class="exam-authoring-summary__chips">
          <span class="exam-authoring-chip exam-authoring-chip--status">Draft</span>
          <span class="exam-authoring-chip exam-authoring-chip--code">${
            escapeHtml(draft.code || "Exam code")
          }</span>
        </div>
        <dl class="exam-authoring-summary__stats">
          <div>
            <dt>Duration</dt>
            <dd>${escapeHtml(draft.durationMinutes || "Not set")} minutes</dd>
          </div>
          <div>
            <dt>Instruction lines</dt>
            <dd>${instructions.length}</dd>
          </div>
          <div>
            <dt>Window opens</dt>
            <dd>${escapeHtml(formatDraftInputDateTime(draft.windowStartsAt))}</dd>
          </div>
          <div>
            <dt>Window closes</dt>
            <dd>${escapeHtml(formatDraftInputDateTime(draft.windowEndsAt))}</dd>
          </div>
        </dl>
        <section class="exam-authoring-summary__preview">
          <h3>${escapeHtml(draft.title || "Draft exam title preview")}</h3>
          <p class="exam-authoring-summary__window">
            ${
              draftWindowMinutes === null
                ? "Complete the schedule fields to preview the active window length."
                : draftWindowMinutes < 0
                  ? "The current schedule closes before it opens."
                  : `Window length: ${draftWindowMinutes} minutes`
            }
          </p>
          ${
            instructions.length === 0
              ? `<p class="exam-authoring-summary__empty">Instructions will appear here once the draft includes at least one line.</p>`
              : `<ol class="exam-authoring-summary__instructions">
                  ${instructions
                    .map(
                      (instruction) =>
                        `<li>${escapeHtml(instruction)}</li>`,
                    )
                    .join("")}
                </ol>`
          }
        </section>
      </section>
      <section class="question-bank-panel exam-authoring-summary">
        <p class="exam-authoring-panel__eyebrow">${
          lastSavedExam ? "Last Saved Draft" : "Validation Rules"
        }</p>
        ${
          lastSavedExam
            ? `
                <h3>${escapeHtml(lastSavedExam.title)}</h3>
                <p class="exam-authoring-summary__saved-code">${escapeHtml(
                  lastSavedExam.code,
                )} · ${escapeHtml(lastSavedExam.examId)}</p>
                <dl class="exam-authoring-summary__stats">
                  <div>
                    <dt>Status</dt>
                    <dd>${lastSavedExam.status}</dd>
                  </div>
                  <div>
                    <dt>Window length</dt>
                    <dd>${getDraftExamWindowDurationMinutes(lastSavedExam)} minutes</dd>
                  </div>
                </dl>
                <p class="exam-authoring-summary__window">${escapeHtml(
                  `${formatDraftExamDateTime(lastSavedExam.windowStartsAt)} to ${formatDraftExamDateTime(
                    lastSavedExam.windowEndsAt,
                  )}`,
                )}</p>
              `
            : `<ul class="exam-authoring-summary__rules">
                <li>Exam title, code, instructions, duration, and schedule are all required before this draft can be saved.</li>
                <li>The exam window must end after it starts.</li>
                <li>The draft duration cannot exceed the scheduled window length.</li>
              </ul>`
        }
      </section>
    </aside>
  `;
};

export const renderCreateDraftExamPage = ({
  draft,
  errors,
  lastSavedExam,
  status,
}: {
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
  lastSavedExam: DraftExamSummary | null;
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
}) =>
  renderExamAuthoringShell({
    title: "Create Draft Exam",
    description:
      "Capture the exam metadata and schedule foundation first, then build sections and assignments on top of a validated draft.",
    headerActions: `
      <a class="question-bank-button question-bank-button--secondary" href="../question-bank/index.html">
        Open question bank
      </a>
    `,
    mainContent: `
      ${renderStatusBanner({ errors, status })}
      <section class="exam-authoring-layout">
        <div class="exam-authoring-main">
          ${renderMetadataPanel({ draft, errors })}
          ${renderSchedulePanel({ draft, errors })}
          ${renderInstructionsPanel({ draft, errors })}
          ${renderActionPanel()}
        </div>
        ${renderLiveSummary({ draft, lastSavedExam })}
      </section>
    `,
  });
