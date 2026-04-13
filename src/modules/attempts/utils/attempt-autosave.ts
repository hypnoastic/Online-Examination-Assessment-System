import type {
  AttemptSessionPayload,
  AttemptSessionQuestionRecord,
} from "../domain/attempt-session.types";
import {
  createAttemptWorkspaceState,
  type AttemptQuestionDraft,
  type AttemptWorkspaceState,
} from "./attempt-workspace";

const ATTEMPT_AUTOSAVE_SCHEMA_VERSION = 1;
const ATTEMPT_AUTOSAVE_STORAGE_PREFIX = "student-attempt-autosave";

type AttemptAutosaveSnapshotDraft = AttemptQuestionDraft;

export type AttemptAutosaveStatus = "idle" | "saving" | "saved" | "failed";

export type AttemptAutosaveTone =
  | "neutral"
  | "positive"
  | "warning"
  | "critical";

export interface AttemptAutosaveSnapshot {
  schemaVersion: typeof ATTEMPT_AUTOSAVE_SCHEMA_VERSION;
  attemptId: string;
  currentQuestionIndex: number;
  savedAt: string;
  drafts: AttemptAutosaveSnapshotDraft[];
}

export interface AttemptAutosaveIndicator {
  tone: AttemptAutosaveTone;
  label: string;
  detail: string;
}

export interface AttemptWorkspaceRecoveryResult {
  state: AttemptWorkspaceState;
  recovered: boolean;
  savedAt: Date | null;
}

const isSingleSelectType = (
  type: AttemptSessionQuestionRecord["type"],
): boolean => type === "SINGLE_CHOICE" || type === "TRUE_FALSE";

const isTextType = (
  type: AttemptSessionQuestionRecord["type"],
): boolean => type === "SHORT_TEXT" || type === "LONG_TEXT";

const clampQuestionIndex = (
  questionCount: number,
  targetIndex: number,
): number => {
  if (questionCount === 0) {
    return 0;
  }

  return Math.min(Math.max(targetIndex, 0), questionCount - 1);
};

const isValidSnapshotDraft = (
  value: unknown,
): value is AttemptAutosaveSnapshotDraft => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.examQuestionId === "string" &&
    typeof candidate.type === "string" &&
    Array.isArray(candidate.selectedOptionIds) &&
    candidate.selectedOptionIds.every((optionId) => typeof optionId === "string") &&
    typeof candidate.textResponse === "string" &&
    typeof candidate.markedForReview === "boolean" &&
    typeof candidate.visited === "boolean"
  );
};

const normalizeSelectedOptionIds = (
  question: AttemptSessionQuestionRecord,
  selectedOptionIds: readonly string[],
): string[] => {
  if (!question.options?.length) {
    return [];
  }

  const validOptionIds = new Set(question.options.map((option) => option.id));
  const normalizedIds = Array.from(
    new Set(selectedOptionIds.filter((optionId) => validOptionIds.has(optionId))),
  );

  return isSingleSelectType(question.type) ? normalizedIds.slice(0, 1) : normalizedIds;
};

const createSnapshotDraft = (
  question: AttemptSessionQuestionRecord,
  draft: AttemptQuestionDraft,
): AttemptAutosaveSnapshotDraft => {
  const selectedOptionIds = normalizeSelectedOptionIds(
    question,
    draft.selectedOptionIds,
  );
  const textResponse = isTextType(question.type) ? draft.textResponse : "";

  return {
    examQuestionId: question.examQuestionId,
    type: question.type,
    selectedOptionIds,
    textResponse,
    markedForReview: draft.markedForReview,
    visited:
      draft.visited ||
      selectedOptionIds.length > 0 ||
      textResponse.trim().length > 0,
  };
};

const createSnapshotDocument = (
  session: Pick<AttemptSessionPayload, "questions">,
  state: AttemptWorkspaceState,
): Omit<AttemptAutosaveSnapshot, "attemptId" | "savedAt" | "schemaVersion"> => {
  const baseState = createAttemptWorkspaceState(session);

  return {
    currentQuestionIndex: clampQuestionIndex(
      session.questions.length,
      state.currentQuestionIndex,
    ),
    drafts: session.questions.map((question) =>
      createSnapshotDraft(
        question,
        state.drafts[question.examQuestionId] ?? baseState.drafts[question.examQuestionId]!,
      ),
    ),
  };
};

export const toAttemptAutosaveStorageKey = (attemptId: string): string =>
  `${ATTEMPT_AUTOSAVE_STORAGE_PREFIX}:${attemptId}`;

export const buildAttemptAutosaveFingerprint = (
  session: Pick<AttemptSessionPayload, "questions">,
  state: AttemptWorkspaceState,
): string => JSON.stringify(createSnapshotDocument(session, state));

export const createAttemptAutosaveSnapshot = (
  attemptId: string,
  session: Pick<AttemptSessionPayload, "questions">,
  state: AttemptWorkspaceState,
  savedAt: Date = new Date(),
): AttemptAutosaveSnapshot => ({
  schemaVersion: ATTEMPT_AUTOSAVE_SCHEMA_VERSION,
  attemptId,
  savedAt: savedAt.toISOString(),
  ...createSnapshotDocument(session, state),
});

export const serializeAttemptAutosaveSnapshot = (
  snapshot: AttemptAutosaveSnapshot,
): string => JSON.stringify(snapshot);

export const parseAttemptAutosaveSnapshot = (
  rawValue: string | null,
): AttemptAutosaveSnapshot | null => {
  if (rawValue === null) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;

    if (
      parsedValue.schemaVersion !== ATTEMPT_AUTOSAVE_SCHEMA_VERSION ||
      typeof parsedValue.attemptId !== "string" ||
      typeof parsedValue.currentQuestionIndex !== "number" ||
      !Number.isInteger(parsedValue.currentQuestionIndex) ||
      typeof parsedValue.savedAt !== "string" ||
      Number.isNaN(new Date(parsedValue.savedAt).getTime()) ||
      !Array.isArray(parsedValue.drafts) ||
      !parsedValue.drafts.every(isValidSnapshotDraft)
    ) {
      return null;
    }

    return {
      schemaVersion: ATTEMPT_AUTOSAVE_SCHEMA_VERSION,
      attemptId: parsedValue.attemptId,
      currentQuestionIndex: parsedValue.currentQuestionIndex,
      savedAt: parsedValue.savedAt,
      drafts: parsedValue.drafts,
    };
  } catch {
    return null;
  }
};

export const recoverAttemptWorkspaceState = (
  attemptId: string,
  session: Pick<AttemptSessionPayload, "questions">,
  snapshot: AttemptAutosaveSnapshot | null,
): AttemptWorkspaceRecoveryResult => {
  const baseState = createAttemptWorkspaceState(session);

  if (snapshot === null || snapshot.attemptId !== attemptId) {
    return {
      state: baseState,
      recovered: false,
      savedAt: null,
    };
  }

  const draftMap = new Map(
    snapshot.drafts.map((draft) => [draft.examQuestionId, draft]),
  );
  const recoveredDrafts = { ...baseState.drafts };

  session.questions.forEach((question) => {
    const persistedDraft = draftMap.get(question.examQuestionId);

    if (!persistedDraft || persistedDraft.type !== question.type) {
      return;
    }

    const selectedOptionIds = normalizeSelectedOptionIds(
      question,
      persistedDraft.selectedOptionIds,
    );
    const textResponse = isTextType(question.type)
      ? persistedDraft.textResponse
      : "";

    recoveredDrafts[question.examQuestionId] = {
      ...baseState.drafts[question.examQuestionId]!,
      selectedOptionIds,
      textResponse,
      markedForReview: persistedDraft.markedForReview,
      visited:
        persistedDraft.visited ||
        selectedOptionIds.length > 0 ||
        textResponse.trim().length > 0,
    };
  });

  return {
    state: {
      currentQuestionIndex: clampQuestionIndex(
        session.questions.length,
        snapshot.currentQuestionIndex,
      ),
      drafts: recoveredDrafts,
    },
    recovered: true,
    savedAt: new Date(snapshot.savedAt),
  };
};

export const buildAttemptAutosaveIndicator = (
  status: AttemptAutosaveStatus,
  failureMessage: string | null = null,
): AttemptAutosaveIndicator => {
  switch (status) {
    case "saving":
      return {
        tone: "warning",
        label: "Saving locally",
        detail:
          "Latest answer changes are being written to local recovery storage.",
      };
    case "saved":
      return {
        tone: "positive",
        label: "Saved locally",
        detail:
          "This browser can recover the active attempt after a refresh or re-entry.",
      };
    case "failed":
      return {
        tone: "critical",
        label: "Autosave failed",
        detail:
          failureMessage ??
          "Local recovery storage is unavailable. Keep the tab open until saving recovers.",
      };
    case "idle":
    default:
      return {
        tone: "neutral",
        label: "Autosave ready",
        detail:
          "Draft changes will save locally for the active attempt as you continue.",
      };
  }
};
