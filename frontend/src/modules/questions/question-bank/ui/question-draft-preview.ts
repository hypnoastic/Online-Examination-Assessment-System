import type { QuestionAuthoringDraft } from "../../domain/question.types";
import { isObjectiveQuestionDraft } from "../../utils/question-authoring";
import { escapeHtml } from "./question-bank-ui.shared";

export const renderQuestionDraftPreviewStructure = ({
  draft,
  emptyAnswerLabel = "Expected answer",
  emptyOptionLabel = "Option text",
}: {
  draft: QuestionAuthoringDraft;
  emptyAnswerLabel?: string;
  emptyOptionLabel?: string;
}) => {
  if (isObjectiveQuestionDraft(draft)) {
    return `
      <ul class="question-draft-preview-list">
        ${draft.options
          .map(
            (option) => `
              <li class="question-draft-preview-list__item${
                option.isCorrect ? " is-correct" : ""
              }">
                <span class="question-draft-preview-list__label">${escapeHtml(
                  option.label,
                )}.</span>
                <span>${escapeHtml(option.text || emptyOptionLabel)}</span>
              </li>
            `,
          )
          .join("")}
      </ul>
    `;
  }

  return `
    <div class="question-draft-preview-answer">
      <p class="question-draft-preview-answer__label">Expected answer</p>
      <p>${escapeHtml(draft.expectedAnswer || emptyAnswerLabel)}</p>
    </div>
`;
};
