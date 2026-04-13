import type {
  AttemptSessionPayload,
  AttemptSessionQuestionRecord,
} from "../domain/attempt-session.types";

export type AttemptNavigationTone =
  | "current"
  | "marked"
  | "answered"
  | "visited"
  | "unanswered";

export interface AttemptQuestionDraft {
  examQuestionId: string;
  type: AttemptSessionQuestionRecord["type"];
  selectedOptionIds: string[];
  textResponse: string;
  markedForReview: boolean;
  visited: boolean;
}

export interface AttemptWorkspaceState {
  currentQuestionIndex: number;
  drafts: Record<string, AttemptQuestionDraft>;
}

export interface AttemptQuestionNavigationItem {
  examQuestionId: string;
  questionOrder: number;
  statusLabel: string;
  tone: AttemptNavigationTone;
  isCurrent: boolean;
  isAnswered: boolean;
  isMarkedForReview: boolean;
  isVisited: boolean;
}

const createQuestionDraft = (
  question: AttemptSessionQuestionRecord,
  visited: boolean,
): AttemptQuestionDraft => ({
  examQuestionId: question.examQuestionId,
  type: question.type,
  selectedOptionIds: [],
  textResponse: "",
  markedForReview: false,
  visited,
});

const updateDraft = (
  state: AttemptWorkspaceState,
  examQuestionId: string,
  updater: (draft: AttemptQuestionDraft) => AttemptQuestionDraft,
): AttemptWorkspaceState => ({
  ...state,
  drafts: {
    ...state.drafts,
    [examQuestionId]: updater(state.drafts[examQuestionId]!),
  },
});

const clampQuestionIndex = (
  questionCount: number,
  targetIndex: number,
): number => {
  if (questionCount === 0) {
    return 0;
  }

  return Math.min(Math.max(targetIndex, 0), questionCount - 1);
};

export const createAttemptWorkspaceState = (
  session: Pick<AttemptSessionPayload, "questions">,
): AttemptWorkspaceState => ({
  currentQuestionIndex: 0,
  drafts: Object.fromEntries(
    session.questions.map((question, index) => [
      question.examQuestionId,
      createQuestionDraft(question, index === 0),
    ]),
  ),
});

export const setAttemptSingleSelectAnswer = (
  state: AttemptWorkspaceState,
  examQuestionId: string,
  selectedOptionId: string | null,
): AttemptWorkspaceState =>
  updateDraft(state, examQuestionId, (draft) => ({
    ...draft,
    selectedOptionIds: selectedOptionId === null ? [] : [selectedOptionId],
    visited: true,
  }));

export const toggleAttemptMultiSelectAnswer = (
  state: AttemptWorkspaceState,
  examQuestionId: string,
  optionId: string,
): AttemptWorkspaceState =>
  updateDraft(state, examQuestionId, (draft) => {
    const isSelected = draft.selectedOptionIds.includes(optionId);

    return {
      ...draft,
      selectedOptionIds: isSelected
        ? draft.selectedOptionIds.filter((id) => id !== optionId)
        : [...draft.selectedOptionIds, optionId],
      visited: true,
    };
  });

export const setAttemptTextAnswer = (
  state: AttemptWorkspaceState,
  examQuestionId: string,
  textResponse: string,
): AttemptWorkspaceState =>
  updateDraft(state, examQuestionId, (draft) => ({
    ...draft,
    textResponse,
    visited: true,
  }));

export const toggleAttemptMarkedForReview = (
  state: AttemptWorkspaceState,
  examQuestionId: string,
): AttemptWorkspaceState =>
  updateDraft(state, examQuestionId, (draft) => ({
    ...draft,
    markedForReview: !draft.markedForReview,
    visited: true,
  }));

export const goToAttemptQuestion = (
  state: AttemptWorkspaceState,
  session: Pick<AttemptSessionPayload, "questions">,
  targetIndex: number,
): AttemptWorkspaceState => {
  const nextIndex = clampQuestionIndex(session.questions.length, targetIndex);
  const nextQuestion = session.questions[nextIndex];

  if (!nextQuestion) {
    return state;
  }

  return updateDraft(
    {
      ...state,
      currentQuestionIndex: nextIndex,
    },
    nextQuestion.examQuestionId,
    (draft) => ({
      ...draft,
      visited: true,
    }),
  );
};

export const goToNextAttemptQuestion = (
  state: AttemptWorkspaceState,
  session: Pick<AttemptSessionPayload, "questions">,
): AttemptWorkspaceState =>
  goToAttemptQuestion(state, session, state.currentQuestionIndex + 1);

export const goToPreviousAttemptQuestion = (
  state: AttemptWorkspaceState,
  session: Pick<AttemptSessionPayload, "questions">,
): AttemptWorkspaceState =>
  goToAttemptQuestion(state, session, state.currentQuestionIndex - 1);

export const isAttemptQuestionAnswered = (
  draft: AttemptQuestionDraft,
): boolean => {
  switch (draft.type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return draft.selectedOptionIds.length > 0;
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return draft.textResponse.trim().length > 0;
  }
};

export const buildAttemptQuestionNavigationItems = (
  session: Pick<AttemptSessionPayload, "questions">,
  state: AttemptWorkspaceState,
): AttemptQuestionNavigationItem[] =>
  session.questions.map((question, index) => {
    const draft = state.drafts[question.examQuestionId]!;
    const isCurrent = state.currentQuestionIndex === index;
    const isAnswered = isAttemptQuestionAnswered(draft);
    const isMarkedForReview = draft.markedForReview;
    const isVisited = draft.visited;

    if (isCurrent && isMarkedForReview) {
      return {
        examQuestionId: question.examQuestionId,
        questionOrder: question.questionOrder,
        statusLabel: "Current • Marked",
        tone: "current",
        isCurrent,
        isAnswered,
        isMarkedForReview,
        isVisited,
      };
    }

    if (isCurrent) {
      return {
        examQuestionId: question.examQuestionId,
        questionOrder: question.questionOrder,
        statusLabel: "Current",
        tone: "current",
        isCurrent,
        isAnswered,
        isMarkedForReview,
        isVisited,
      };
    }

    if (isMarkedForReview) {
      return {
        examQuestionId: question.examQuestionId,
        questionOrder: question.questionOrder,
        statusLabel: "Marked",
        tone: "marked",
        isCurrent,
        isAnswered,
        isMarkedForReview,
        isVisited,
      };
    }

    if (isAnswered) {
      return {
        examQuestionId: question.examQuestionId,
        questionOrder: question.questionOrder,
        statusLabel: "Answered",
        tone: "answered",
        isCurrent,
        isAnswered,
        isMarkedForReview,
        isVisited,
      };
    }

    if (isVisited) {
      return {
        examQuestionId: question.examQuestionId,
        questionOrder: question.questionOrder,
        statusLabel: "Visited",
        tone: "visited",
        isCurrent,
        isAnswered,
        isMarkedForReview,
        isVisited,
      };
    }

    return {
      examQuestionId: question.examQuestionId,
      questionOrder: question.questionOrder,
      statusLabel: "Unanswered",
      tone: "unanswered",
      isCurrent,
      isAnswered,
      isMarkedForReview,
      isVisited,
    };
  });
