import { escapeHtml } from "../../../questions/question-bank/ui/question-bank-ui.shared";
import type { DraftExamSummary } from "../../domain/exam.types";
import type {
  DraftExamAuthoringDraft,
  DraftExamAuthoringFormErrors,
} from "../exam-authoring-form";
import {
  formatDraftExamDateTime,
  getDraftExamAssignedStudentCount,
  getDraftExamManualReviewQuestionCount,
  getDraftExamMappedQuestionCount,
  getDraftExamPublishReadiness,
  getDraftExamSectionTotalMarks,
  getDraftExamTotalMarks,
  getDraftExamWindowDurationMinutes,
  isQuestionMappedInDraft,
  isStudentAssignedInDraft,
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

const toDifficultyTone = (difficulty: QuestionBankEntry["difficulty"]) =>
  difficulty.toLowerCase() as "easy" | "medium" | "hard";

const getStatusToneClass = (status: DraftExamAuthoringDraft["status"]) =>
  status === "SCHEDULED" ? "exam-authoring-chip--scheduled" : "exam-authoring-chip--draft";

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
        <p>Metadata, mapped questions, assignments, and publish readiness stay aligned here before the exam reaches students.</p>
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
  <section id="metadata" class="question-bank-panel exam-authoring-panel">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Metadata</p>
        <h2>Set the draft identity</h2>
      </div>
      <p class="exam-authoring-panel__helper">Title, code, and duration define the contract the schedule, assignments, and publish checks rely on.</p>
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
        <p class="exam-authoring-panel__helper">The window must open before it closes, and the configured duration has to fit inside that availability.</p>
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
      <p class="exam-authoring-panel__helper">Use one clear instruction per line so the saved exam carries stable student-facing copy.</p>
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

const renderQuestionSnapshotMeta = ({
  difficulty,
  topicName,
  type,
}: Pick<QuestionBankEntry, "difficulty" | "topicName" | "type">) => `
  <div class="exam-builder-question__chips">
    ${renderQuestionBankChip(QUESTION_TYPE_LABELS[type], "type")}
    ${renderQuestionBankChip(
      QUESTION_DIFFICULTY_LABELS[difficulty],
      toDifficultyTone(difficulty),
    )}
    ${renderQuestionBankChip(topicName, "topic")}
  </div>
`;

const renderSectionQuestionRows = ({
  section,
  sectionIndex,
  errors,
}: {
  section: DraftExamSectionAuthoringDraft;
  sectionIndex: number;
  errors: DraftExamAuthoringFormErrors;
}) => `
  <div class="exam-builder-question-list">
    ${section.questions
      .map((question, questionIndex) => {
        const questionErrors =
          errors.questionFields[sectionIndex]?.[questionIndex] ?? {};

        return `
          <article class="exam-builder-question">
            <div class="exam-builder-question__main">
              <div class="exam-builder-question__identity">
                <span class="exam-builder-question__order">${question.questionOrder}</span>
                <div>
                  <p class="exam-builder-question__eyebrow">${escapeHtml(
                    `${question.examQuestionId} · ${question.snapshot.sourceQuestionId}`,
                  )}</p>
                  <h4>${escapeHtml(question.snapshot.stem)}</h4>
                  ${renderQuestionSnapshotMeta({
                    difficulty: question.snapshot.difficulty,
                    topicName: question.snapshot.topicName,
                    type: question.snapshot.type,
                  })}
                </div>
              </div>
              <div class="exam-builder-question__controls">
                <label class="question-bank-field exam-builder-question__marks">
                  <span class="question-bank-field__label">Marks</span>
                  <input
                    class="question-bank-field__control"
                    type="number"
                    min="1"
                    step="1"
                    value="${escapeHtml(question.marks)}"
                    data-focus-id="${section.sectionId}-${question.examQuestionId}-marks"
                    data-section-id="${escapeHtml(section.sectionId)}"
                    data-exam-question-id="${escapeHtml(question.examQuestionId)}"
                    data-question-field="marks"
                  />
                  ${renderErrorMessages(questionErrors.marks)}
                </label>
                <div class="exam-builder-question__buttons">
                  <button
                    class="question-bank-button question-bank-button--secondary"
                    type="button"
                    data-action="move-question-up"
                    data-section-id="${escapeHtml(section.sectionId)}"
                    data-exam-question-id="${escapeHtml(question.examQuestionId)}"
                    ${questionIndex === 0 ? 'disabled="disabled"' : ""}
                  >
                    Up
                  </button>
                  <button
                    class="question-bank-button question-bank-button--secondary"
                    type="button"
                    data-action="move-question-down"
                    data-section-id="${escapeHtml(section.sectionId)}"
                    data-exam-question-id="${escapeHtml(question.examQuestionId)}"
                    ${
                      questionIndex === section.questions.length - 1
                        ? 'disabled="disabled"'
                        : ""
                    }
                  >
                    Down
                  </button>
                  <button
                    class="question-bank-button question-bank-button--secondary"
                    type="button"
                    data-action="remove-question"
                    data-section-id="${escapeHtml(section.sectionId)}"
                    data-exam-question-id="${escapeHtml(question.examQuestionId)}"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("")}
  </div>
`;

const renderSectionBuilderPanel = ({
  activeSectionId,
  draft,
  errors,
}: {
  activeSectionId: string | null;
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
}) => `
  <section class="question-bank-panel exam-authoring-panel">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Section Builder</p>
        <h2>Group questions into ordered sections</h2>
      </div>
      <div class="exam-builder-panel__actions">
        <p class="exam-authoring-panel__helper">Each section keeps its own ordered question list and marks grouping for the final exam structure.</p>
        <button
          class="question-bank-button"
          type="button"
          data-action="add-section"
        >
          Add section
        </button>
      </div>
    </div>
    ${
      draft.sections.length === 0
        ? `<div class="exam-builder-empty">
            <h3>No sections yet</h3>
            <p>Add the first section, then map question-bank items into it.</p>
          </div>`
        : `<div class="exam-builder-section-list">
            ${draft.sections
              .map((section, sectionIndex) => {
                const sectionErrors = errors.sectionFields[sectionIndex] ?? {};
                const isActive = section.sectionId === activeSectionId;

                return `
                  <article class="exam-builder-section${
                    isActive ? " is-active" : ""
                  }">
                    <div class="exam-builder-section__header">
                      <div class="exam-builder-section__identity">
                        <span class="exam-builder-section__badge">Section ${section.sectionOrder}</span>
                        <div>
                          <p>${section.questions.length} question${
                            section.questions.length === 1 ? "" : "s"
                          } · ${getDraftExamSectionTotalMarks(section)} marks</p>
                        </div>
                      </div>
                      <div class="exam-builder-section__buttons">
                        <button
                          class="question-bank-button${
                            isActive ? " question-bank-button--secondary" : ""
                          }"
                          type="button"
                          data-action="activate-section"
                          data-section-id="${escapeHtml(section.sectionId)}"
                        >
                          ${isActive ? "Mapping selected" : "Map questions"}
                        </button>
                        <button
                          class="question-bank-button question-bank-button--secondary"
                          type="button"
                          data-action="move-section-up"
                          data-section-id="${escapeHtml(section.sectionId)}"
                          ${sectionIndex === 0 ? 'disabled="disabled"' : ""}
                        >
                          Up
                        </button>
                        <button
                          class="question-bank-button question-bank-button--secondary"
                          type="button"
                          data-action="move-section-down"
                          data-section-id="${escapeHtml(section.sectionId)}"
                          ${
                            sectionIndex === draft.sections.length - 1
                              ? 'disabled="disabled"'
                              : ""
                          }
                        >
                          Down
                        </button>
                        <button
                          class="question-bank-button question-bank-button--secondary"
                          type="button"
                          data-action="remove-section"
                          data-section-id="${escapeHtml(section.sectionId)}"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <label class="question-bank-field">
                      <span class="question-bank-field__label">Section title</span>
                      <input
                        class="question-bank-field__control"
                        type="text"
                        value="${escapeHtml(section.title)}"
                        placeholder="e.g. Objective Core"
                        data-focus-id="${section.sectionId}-title"
                        data-section-id="${escapeHtml(section.sectionId)}"
                        data-section-field="title"
                      />
                      ${renderErrorMessages(sectionErrors.title)}
                    </label>
                    ${renderErrorMessages(sectionErrors.questions)}
                    ${
                      section.questions.length === 0
                        ? `<div class="exam-builder-section__empty">
                            <p>No questions mapped yet. Select this section, then add items from the question bank rail.</p>
                          </div>`
                        : renderSectionQuestionRows({
                            section,
                            sectionIndex,
                            errors,
                          })
                    }
                  </article>
                `;
              })
              .join("")}
          </div>`
    }
  </section>
`;

const getMappedQuestionLocation = (
  draft: DraftExamAuthoringDraft,
  sourceQuestionId: string,
) =>
  draft.sections.find((section) =>
    section.questions.some(
      (question) => question.snapshot.sourceQuestionId === sourceQuestionId,
    ),
  )?.title ?? null;

const renderQuestionMappingPanel = ({
  activeSectionId,
  draft,
  questionBankEntries,
}: {
  activeSectionId: string | null;
  draft: DraftExamAuthoringDraft;
  questionBankEntries: QuestionBankEntry[];
}) => {
  const activeSection =
    draft.sections.find((section) => section.sectionId === activeSectionId) ??
    null;

  return `
    <section id="question-mapping" class="question-bank-panel exam-authoring-summary exam-builder-bank">
      <div class="exam-authoring-panel__heading">
        <div>
          <p class="exam-authoring-panel__eyebrow">Question Mapping</p>
          <h3>Add reusable questions</h3>
        </div>
        <p class="exam-authoring-panel__helper">${
          activeSection
            ? `Currently mapping into ${activeSection.title}.`
            : "Choose or add a section before mapping questions."
        }</p>
      </div>
      <div class="exam-builder-bank__list">
        ${questionBankEntries
          .map((entry) => {
            const isMapped = isQuestionMappedInDraft(draft, entry.id);
            const mappedLocation = getMappedQuestionLocation(draft, entry.id);

            return `
              <article class="exam-builder-bank__item${
                isMapped ? " is-mapped" : ""
              }">
                <p class="exam-builder-bank__eyebrow">${escapeHtml(
                  `${entry.id} · ${entry.reviewMode === "MANUAL" ? "Manual review" : "Objective"}`,
                )}</p>
                <h4>${escapeHtml(entry.stem)}</h4>
                ${renderQuestionSnapshotMeta(entry)}
                <p class="exam-builder-bank__detail">${
                  isMapped && mappedLocation
                    ? `Mapped to ${escapeHtml(mappedLocation)}`
                    : `Ready to map into ${escapeHtml(activeSection?.title ?? "a section")}`
                }</p>
                <button
                  class="question-bank-button${isMapped ? " question-bank-button--secondary" : ""}"
                  type="button"
                  data-action="map-question"
                  data-question-id="${escapeHtml(entry.id)}"
                  ${
                    isMapped || !activeSection ? 'disabled="disabled"' : ""
                  }
                >
                  ${
                    isMapped
                      ? "Already mapped"
                      : activeSection
                        ? `Add to ${escapeHtml(activeSection.title)}`
                        : "Select a section"
                  }
                </button>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
};

const renderAssignmentCandidatePill = ({
  tone,
  label,
}: {
  tone: "eligible" | "neutral" | "blocked";
  label: string;
}) =>
  `<span class="exam-assignment-pill exam-assignment-pill--${tone}">${escapeHtml(
    label,
  )}</span>`;

const renderAssignmentMeta = ({
  department,
  studentEmail,
  studentRole,
  studentStatus,
}: Pick<
  DraftExamAssignmentAuthoringDraft,
  "department" | "studentEmail" | "studentRole" | "studentStatus"
>) => `
  <div class="exam-assignment-row__meta">
    ${renderAssignmentCandidatePill({
      tone: studentRole === "STUDENT" ? "eligible" : "blocked",
      label: studentRole,
    })}
    ${renderAssignmentCandidatePill({
      tone: studentStatus === "ACTIVE" ? "eligible" : "blocked",
      label: studentStatus,
    })}
    ${renderAssignmentCandidatePill({
      tone: "neutral",
      label: department,
    })}
    ${renderAssignmentCandidatePill({
      tone: "neutral",
      label: studentEmail,
    })}
  </div>
`;

const renderAssignedStudentsList = ({
  assignments,
  errors,
}: {
  assignments: DraftExamAssignmentAuthoringDraft[];
  errors: DraftExamAuthoringFormErrors;
}) =>
  assignments.length === 0
    ? `<div class="exam-builder-empty">
        <h3>No students assigned yet</h3>
        <p>Assign at least one active student to unlock exam publication.</p>
      </div>`
    : `<div class="exam-assignment-list">
        ${assignments
          .map((assignment, assignmentIndex) => {
            const assignmentErrors =
              errors.assignmentFields[assignmentIndex] ?? {};
            const hasIssue =
              Object.values(assignmentErrors).some(
                (fieldMessages) => (fieldMessages?.length ?? 0) > 0,
              ) || assignment.studentRole !== "STUDENT" || assignment.studentStatus !== "ACTIVE";

            return `
              <article class="exam-assignment-row${
                hasIssue ? " is-invalid" : ""
              }">
                <div class="exam-assignment-row__main">
                  <div>
                    <p class="exam-builder-question__eyebrow">${escapeHtml(
                      `${assignment.assignmentId} · ${assignment.studentId}`,
                    )}</p>
                    <h4>${escapeHtml(assignment.studentName)}</h4>
                    ${renderAssignmentMeta(assignment)}
                  </div>
                  <button
                    class="question-bank-button question-bank-button--secondary"
                    type="button"
                    data-action="remove-assignment"
                    data-student-id="${escapeHtml(assignment.studentId)}"
                  >
                    Remove
                  </button>
                </div>
                ${renderErrorMessages(assignmentErrors.studentId)}
                ${renderErrorMessages(assignmentErrors.studentRole)}
                ${renderErrorMessages(assignmentErrors.studentStatus)}
              </article>
            `;
          })
          .join("")}
      </div>`;

const renderAssignmentCandidateRows = ({
  assignmentCandidates,
  draft,
}: {
  assignmentCandidates: ExamAssignmentCandidate[];
  draft: DraftExamAuthoringDraft;
}) => `
  <div class="exam-assignment-list">
    ${assignmentCandidates
      .map((candidate) => {
        const alreadyAssigned = isStudentAssignedInDraft(draft, candidate.userId);
        const isEligible = candidate.role === "STUDENT" && candidate.status === "ACTIVE";
        const buttonLabel = alreadyAssigned
          ? "Already assigned"
          : candidate.role !== "STUDENT"
            ? "Not a student"
            : candidate.status !== "ACTIVE"
              ? "Inactive user"
              : "Assign student";
        const helperText = alreadyAssigned
          ? "This student is already mapped to the exam."
          : isEligible
            ? "Eligible for this exam assignment."
            : candidate.role !== "STUDENT"
              ? "Only student accounts can be assigned."
              : "Inactive students cannot be published to an exam.";

        return `
          <article class="exam-assignment-row exam-assignment-row--candidate">
            <div class="exam-assignment-row__main">
              <div>
                <p class="exam-builder-question__eyebrow">${escapeHtml(candidate.userId)}</p>
                <h4>${escapeHtml(candidate.name)}</h4>
                <div class="exam-assignment-row__meta">
                  ${renderAssignmentCandidatePill({
                    tone: candidate.role === "STUDENT" ? "eligible" : "blocked",
                    label: candidate.role,
                  })}
                  ${renderAssignmentCandidatePill({
                    tone: candidate.status === "ACTIVE" ? "eligible" : "blocked",
                    label: candidate.status,
                  })}
                  ${renderAssignmentCandidatePill({
                    tone: "neutral",
                    label: candidate.department,
                  })}
                </div>
                <p class="exam-builder-bank__detail">${escapeHtml(
                  `${candidate.email} · ${helperText}`,
                )}</p>
              </div>
              <button
                class="question-bank-button${
                  alreadyAssigned || !isEligible
                    ? " question-bank-button--secondary"
                    : ""
                }"
                type="button"
                data-action="assign-student"
                data-student-id="${escapeHtml(candidate.userId)}"
                ${alreadyAssigned || !isEligible ? 'disabled="disabled"' : ""}
              >
                ${escapeHtml(buttonLabel)}
              </button>
            </div>
          </article>
        `;
      })
      .join("")}
  </div>
`;

const renderAssignmentPanel = ({
  assignmentCandidates,
  draft,
  errors,
}: {
  assignmentCandidates: ExamAssignmentCandidate[];
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
}) => `
  <section class="question-bank-panel exam-authoring-panel">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Assignments</p>
        <h2>Assign students to the exam</h2>
      </div>
      <p class="exam-authoring-panel__helper">Duplicate assignments disable automatically, and only active student accounts are publish-ready.</p>
    </div>
    <div class="exam-assignment-grid">
      <section class="exam-assignment-column">
        <div class="exam-assignment-column__header">
          <div>
            <p class="exam-authoring-panel__eyebrow">Assigned Students</p>
            <h3>${getDraftExamAssignedStudentCount(draft)} current assignment${
              getDraftExamAssignedStudentCount(draft) === 1 ? "" : "s"
            }</h3>
          </div>
          <p class="exam-authoring-panel__helper">These records become the publish gate for student eligibility.</p>
        </div>
        ${renderAssignedStudentsList({ assignments: draft.assignments, errors })}
      </section>
      <section class="exam-assignment-column">
        <div class="exam-assignment-column__header">
          <div>
            <p class="exam-authoring-panel__eyebrow">Eligible Directory</p>
            <h3>Available users</h3>
          </div>
          <p class="exam-authoring-panel__helper">Use the current roster to add valid students without leaving the builder.</p>
        </div>
        ${renderAssignmentCandidateRows({ assignmentCandidates, draft })}
      </section>
    </div>
  </section>
`;

const renderSectionSummaryList = ({
  emptyCopy,
  sections,
}: {
  emptyCopy: string;
  sections: Array<
    Pick<DraftExamSectionAuthoringDraft, "questions" | "sectionOrder" | "title"> |
      Pick<DraftExamSummary["sections"][number], "questions" | "sectionOrder" | "title">
  >;
}) =>
  sections.length === 0
    ? `<p class="exam-authoring-summary__empty">${escapeHtml(emptyCopy)}</p>`
    : `<div class="exam-authoring-summary__sections">
        ${sections
          .map(
            (section) => `
              <article class="exam-authoring-summary__section">
                <div>
                  <p class="exam-authoring-summary__section-order">Section ${section.sectionOrder}</p>
                  <h4>${escapeHtml(section.title)}</h4>
                </div>
                <p>${section.questions.length} question${
              section.questions.length === 1 ? "" : "s"
            } · ${getDraftExamSectionTotalMarks(section)} marks</p>
              </article>
            `,
          )
          .join("")}
      </div>`;

const renderAssignmentSummaryList = ({
  assignments,
  emptyCopy,
}: {
  assignments: Array<
    Pick<
      DraftExamAssignmentAuthoringDraft,
      "studentId" | "studentName" | "department" | "studentStatus"
    > |
      Pick<
        DraftExamSummary["assignments"][number],
        "studentId" | "studentName" | "department" | "studentStatus"
      >
  >;
  emptyCopy: string;
}) =>
  assignments.length === 0
    ? `<p class="exam-authoring-summary__empty">${escapeHtml(emptyCopy)}</p>`
    : `<div class="exam-authoring-summary__sections">
        ${assignments
          .map(
            (assignment) => `
              <article class="exam-authoring-summary__section">
                <div>
                  <p class="exam-authoring-summary__section-order">${escapeHtml(
                    assignment.studentId,
                  )}</p>
                  <h4>${escapeHtml(assignment.studentName)}</h4>
                </div>
                <p>${escapeHtml(
                  `${assignment.department} · ${assignment.studentStatus}`,
                )}</p>
              </article>
            `,
          )
          .join("")}
      </div>`;

const renderLiveSummary = ({
  draft,
}: {
  draft: DraftExamAuthoringDraft;
}) => {
  const instructions = parseDraftExamInstructions(draft.instructionsText);
  const draftWindowMinutes = getDraftWindowMinutes(draft);

  return `
    <section class="question-bank-panel exam-authoring-summary">
      <p class="exam-authoring-panel__eyebrow">Live Summary</p>
      <div class="exam-authoring-summary__chips">
        <span class="exam-authoring-chip ${getStatusToneClass(draft.status)}">${escapeHtml(
          draft.status,
        )}</span>
        <span class="exam-authoring-chip exam-authoring-chip--code">${
          escapeHtml(draft.code || "Exam code")
        }</span>
      </div>
      <dl class="exam-authoring-summary__stats">
        <div>
          <dt>Sections</dt>
          <dd>${draft.sections.length}</dd>
        </div>
        <div>
          <dt>Mapped questions</dt>
          <dd>${getDraftExamMappedQuestionCount(draft)}</dd>
        </div>
        <div>
          <dt>Assigned students</dt>
          <dd>${getDraftExamAssignedStudentCount(draft)}</dd>
        </div>
        <div>
          <dt>Total marks</dt>
          <dd>${getDraftExamTotalMarks(draft)}</dd>
        </div>
        <div>
          <dt>Manual review</dt>
          <dd>${getDraftExamManualReviewQuestionCount(draft)}</dd>
        </div>
        <div>
          <dt>Window preview</dt>
          <dd>${getDraftWindowLengthLabel(draftWindowMinutes)}</dd>
        </div>
      </dl>
      <section class="exam-authoring-summary__preview">
        <h3>${escapeHtml(draft.title || "Draft exam title preview")}</h3>
        <p class="exam-authoring-summary__window">
          ${escapeHtml(
            `${formatDraftInputDateTime(draft.windowStartsAt)} to ${formatDraftInputDateTime(
              draft.windowEndsAt,
            )}`,
          )}
        </p>
        ${
          instructions.length === 0
            ? `<p class="exam-authoring-summary__empty">Instructions will appear here once the exam includes at least one line.</p>`
            : `<ol class="exam-authoring-summary__instructions">
                ${instructions
                  .map((instruction) => `<li>${escapeHtml(instruction)}</li>`)
                  .join("")}
              </ol>`
        }
        ${renderSectionSummaryList({
          emptyCopy:
            "Add sections and map reusable questions to see the builder summary here.",
          sections: draft.sections,
        })}
      </section>
    </section>
  `;
};

const renderReadinessPanel = ({
  draft,
  readiness,
}: {
  draft: DraftExamAuthoringDraft;
  readiness: DraftExamPublishReadiness;
}) => `
  <section class="question-bank-panel exam-authoring-summary exam-readiness">
    <div class="exam-authoring-panel__heading">
      <div>
        <p class="exam-authoring-panel__eyebrow">Publish Readiness</p>
        <h3>${readiness.isReady ? "Ready to schedule" : "Blocked"}</h3>
      </div>
      <span class="exam-authoring-chip ${getStatusToneClass(draft.status)}">${escapeHtml(
        draft.status,
      )}</span>
    </div>
    <p class="exam-authoring-summary__window">${
      readiness.isReady
        ? "Questions, schedule, and assignments are aligned for publication."
        : "Resolve each blocked check before the exam can be published."
    }</p>
    <div class="exam-readiness__list">
      ${readiness.checks
        .map(
          (check) => `
            <article class="exam-readiness__item${
              check.ready ? " is-ready" : " is-blocked"
            }">
              <div>
                <p class="exam-readiness__label">${escapeHtml(check.label)}</p>
                <h4>${escapeHtml(check.ready ? "Ready" : "Needs work")}</h4>
              </div>
              <p>${escapeHtml(check.detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  </section>
`;

const renderLastSavedDraftPanel = ({
  lastSavedExam,
}: {
  lastSavedExam: DraftExamSummary | null;
}) => `
  <section class="question-bank-panel exam-authoring-summary">
    <p class="exam-authoring-panel__eyebrow">${
      lastSavedExam ? "Last Saved Exam" : "Validation Rules"
    }</p>
    ${
      lastSavedExam
        ? `
            <div class="exam-authoring-summary__chips">
              <span class="exam-authoring-chip ${getStatusToneClass(lastSavedExam.status)}">${escapeHtml(
                lastSavedExam.status,
              )}</span>
              <span class="exam-authoring-chip exam-authoring-chip--code">${escapeHtml(
                lastSavedExam.code,
              )}</span>
            </div>
            <h3>${escapeHtml(lastSavedExam.title)}</h3>
            <p class="exam-authoring-summary__saved-code">${escapeHtml(
              lastSavedExam.examId,
            )}</p>
            <dl class="exam-authoring-summary__stats">
              <div>
                <dt>Window length</dt>
                <dd>${getDraftExamWindowDurationMinutes(lastSavedExam)} minutes</dd>
              </div>
              <div>
                <dt>Questions</dt>
                <dd>${getDraftExamMappedQuestionCount(lastSavedExam)}</dd>
              </div>
              <div>
                <dt>Assignments</dt>
                <dd>${getDraftExamAssignedStudentCount(lastSavedExam)}</dd>
              </div>
              <div>
                <dt>Total marks</dt>
                <dd>${getDraftExamTotalMarks(lastSavedExam)}</dd>
              </div>
            </dl>
            <p class="exam-authoring-summary__window">${escapeHtml(
              `${formatDraftExamDateTime(lastSavedExam.windowStartsAt)} to ${formatDraftExamDateTime(
                lastSavedExam.windowEndsAt,
              )}`,
            )}</p>
            ${renderSectionSummaryList({
              emptyCopy: "No sections saved in this exam yet.",
              sections: lastSavedExam.sections,
            })}
            ${renderAssignmentSummaryList({
              assignments: lastSavedExam.assignments,
              emptyCopy: "No student assignments saved in this exam yet.",
            })}
          `
        : `<ul class="exam-authoring-summary__rules">
            <li>The exam window must be valid, and duration has to fit inside it.</li>
            <li>Every section needs a title and at least one mapped question before publication.</li>
            <li>Only active student accounts can be assigned, and each student can appear once.</li>
          </ul>`
    }
  </section>
`;

const renderActionPanel = ({
  readiness,
  status,
}: {
  readiness: DraftExamPublishReadiness;
  status: DraftExamAuthoringDraft["status"];
}) => `
  <section class="question-bank-panel exam-authoring-actions">
    <div>
      <h2>${status === "SCHEDULED" ? "Update this scheduled exam" : "Save or publish this exam"}</h2>
      <p>${
        readiness.isReady
          ? "The builder is publish-ready. Save if you want a checkpoint, or publish now to move the exam into scheduled availability."
          : "Saving keeps progress safe, but publish stays blocked until the readiness checks on the right rail all pass."
      }</p>
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
        class="question-bank-button question-bank-button--secondary"
        type="button"
        data-action="submit-draft"
      >
        Save draft exam
      </button>
      <button
        class="question-bank-button"
        type="button"
        data-action="publish-exam"
      >
        Publish exam
      </button>
    </div>
  </section>
`;

export const renderCreateDraftExamPage = ({
  activeSectionId,
  assignmentCandidates,
  draft,
  errors,
  lastSavedExam,
  questionBankEntries,
  status,
}: {
  activeSectionId: string | null;
  assignmentCandidates: ExamAssignmentCandidate[];
  draft: DraftExamAuthoringDraft;
  errors: DraftExamAuthoringFormErrors;
  lastSavedExam: DraftExamSummary | null;
  questionBankEntries: QuestionBankEntry[];
  status:
    | { tone: "success"; title: string; detail: string }
    | { tone: "error"; title: string; detail: string }
    | null;
}) => {
  const readiness = getDraftExamPublishReadiness(draft);

  return renderExamAuthoringShell({
    title: "Create Draft Exam",
    description:
      "Capture metadata, organize sections, assign students, and keep publish readiness visible while the exam moves from draft to scheduled availability.",
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
          ${renderSectionBuilderPanel({ activeSectionId, draft, errors })}
          ${renderAssignmentPanel({ assignmentCandidates, draft, errors })}
          ${renderActionPanel({ readiness, status: draft.status })}
        </div>
        <aside class="exam-authoring-sidebar">
          ${renderReadinessPanel({ draft, readiness })}
          ${renderQuestionMappingPanel({
            activeSectionId,
            draft,
            questionBankEntries,
          })}
          ${renderLiveSummary({ draft })}
          ${renderLastSavedDraftPanel({ lastSavedExam })}
        </aside>
      </section>
    `,
  });
};
