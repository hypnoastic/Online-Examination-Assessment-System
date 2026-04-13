import type { AttemptSessionPayload } from "../domain/attempt-session.types";
import {
  buildAttemptQuestionNavigationItems,
  type AttemptWorkspaceState,
} from "./attempt-workspace";

export type AttemptSubmissionPhase =
  | "active"
  | "confirming"
  | "submitting"
  | "submitted"
  | "auto_submitted";

export type AttemptSubmissionTone = "neutral" | "success" | "warning";

export interface AttemptSubmissionState {
  phase: AttemptSubmissionPhase;
  finalizedAt: Date | null;
  finalizationReason: "manual" | "timeout" | null;
}

export interface AttemptSubmissionSummary {
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  answeredQuestionOrders: number[];
  unansweredQuestionOrders: number[];
  markedQuestionOrders: number[];
}

export interface AttemptSubmissionPresentation {
  tone: AttemptSubmissionTone;
  statusLabel: string;
  title: string;
  detail: string;
}

export const createInitialAttemptSubmissionState =
  (): AttemptSubmissionState => ({
    phase: "active",
    finalizedAt: null,
    finalizationReason: null,
  });

export const openAttemptSubmissionConfirmation = (
  state: AttemptSubmissionState,
): AttemptSubmissionState =>
  state.phase === "active"
    ? {
        ...state,
        phase: "confirming",
      }
    : state;

export const closeAttemptSubmissionConfirmation = (
  state: AttemptSubmissionState,
): AttemptSubmissionState =>
  state.phase === "confirming"
    ? {
        ...state,
        phase: "active",
      }
    : state;

export const startAttemptSubmission = (
  state: AttemptSubmissionState,
): AttemptSubmissionState =>
  state.phase === "confirming"
    ? {
        ...state,
        phase: "submitting",
      }
    : state;

export const completeAttemptSubmission = (
  state: AttemptSubmissionState,
  finalizedAt: Date = new Date(),
): AttemptSubmissionState => {
  if (state.phase !== "submitting") {
    return state;
  }

  return {
    phase: "submitted",
    finalizedAt,
    finalizationReason: "manual",
  };
};

export const applyAttemptAutoSubmit = (
  state: AttemptSubmissionState,
  finalizedAt: Date = new Date(),
): AttemptSubmissionState => {
  if (state.phase === "submitted" || state.phase === "auto_submitted") {
    return state;
  }

  return {
    phase: "auto_submitted",
    finalizedAt,
    finalizationReason: "timeout",
  };
};

export const isAttemptSubmissionBusy = (
  state: AttemptSubmissionState,
): boolean => state.phase === "submitting";

export const isAttemptFinalized = (
  state: AttemptSubmissionState,
): boolean => state.phase === "submitted" || state.phase === "auto_submitted";

export const isAttemptInteractionLocked = (
  state: AttemptSubmissionState,
): boolean => isAttemptSubmissionBusy(state) || isAttemptFinalized(state);

export const buildAttemptSubmissionSummary = (
  session: Pick<AttemptSessionPayload, "questions">,
  state: AttemptWorkspaceState,
): AttemptSubmissionSummary => {
  const navigationItems = buildAttemptQuestionNavigationItems(session, state);
  const answeredQuestionOrders = navigationItems
    .filter((item) => item.isAnswered)
    .map((item) => item.questionOrder);
  const unansweredQuestionOrders = navigationItems
    .filter((item) => !item.isAnswered)
    .map((item) => item.questionOrder);
  const markedQuestionOrders = navigationItems
    .filter((item) => item.isMarkedForReview)
    .map((item) => item.questionOrder);

  return {
    totalQuestions: navigationItems.length,
    answeredCount: answeredQuestionOrders.length,
    unansweredCount: unansweredQuestionOrders.length,
    markedCount: markedQuestionOrders.length,
    answeredQuestionOrders,
    unansweredQuestionOrders,
    markedQuestionOrders,
  };
};

export const buildAttemptSubmissionPresentation = (
  state: AttemptSubmissionState,
  summary: AttemptSubmissionSummary,
): AttemptSubmissionPresentation => {
  const answerSummary = `${summary.answeredCount}/${summary.totalQuestions} questions answered`;

  switch (state.phase) {
    case "confirming":
      return {
        tone: "neutral",
        statusLabel: "Ready to Submit",
        title: "Review submission before finalizing",
        detail:
          summary.unansweredCount > 0
            ? `${answerSummary}. ${summary.unansweredCount} questions will be submitted unanswered.`
            : `${answerSummary}. All questions currently have an answer draft.`,
      };
    case "submitting":
      return {
        tone: "neutral",
        statusLabel: "Submitting",
        title: "Finalizing attempt submission",
        detail:
          "A submit action is already in progress. Keep this screen open until the attempt reaches a stable final state.",
      };
    case "submitted":
      return {
        tone: "success",
        statusLabel: "Submitted",
        title: "Attempt submitted successfully",
        detail:
          summary.unansweredCount > 0
            ? `${answerSummary}. ${summary.unansweredCount} questions were left unanswered at submission time.`
            : `${answerSummary}. No unanswered questions remained at submission time.`,
      };
    case "auto_submitted":
      return {
        tone: "warning",
        statusLabel: "Auto-Submitted",
        title: "Attempt closed after the timer expired",
        detail:
          summary.unansweredCount > 0
            ? `${answerSummary}. ${summary.unansweredCount} questions were still unanswered when the timeout forced submission.`
            : `${answerSummary}. The timer expired after all current answers had already been captured.`,
      };
    case "active":
    default:
      return {
        tone: "neutral",
        statusLabel: "In Progress",
        title: "Attempt is still active",
        detail:
          summary.unansweredCount > 0
            ? `${answerSummary}. ${summary.unansweredCount} questions are still unanswered.`
            : `${answerSummary}. The attempt is ready for final review or submission.`,
      };
  }
};
