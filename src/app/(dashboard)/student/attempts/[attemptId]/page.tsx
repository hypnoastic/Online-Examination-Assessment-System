"use client";

import {
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  applyAttemptAutoSubmit,
  buildAttemptAutosaveFingerprint,
  buildAttemptAutosaveIndicator,
  buildAttemptTimerViewModel,
  buildAttemptQuestionNavigationItems,
  buildAttemptSubmissionPresentation,
  buildAttemptSubmissionSummary,
  closeAttemptSubmissionConfirmation,
  completeAttemptSubmission,
  createAttemptAutosaveSnapshot,
  createInitialAttemptSubmissionState,
  createAttemptWorkspaceState,
  goToAttemptQuestion,
  goToNextAttemptQuestion,
  goToPreviousAttemptQuestion,
  isAttemptFinalized,
  isAttemptQuestionAnswered,
  isAttemptInteractionLocked,
  isAttemptSubmissionBusy,
  listStudentAttemptBootstrapRecords,
  openAttemptSubmissionConfirmation,
  parseAttemptAutosaveSnapshot,
  recoverAttemptWorkspaceState,
  resolveAttemptSessionEntry,
  serializeAttemptAutosaveSnapshot,
  setAttemptSingleSelectAnswer,
  startAttemptSubmission,
  setAttemptTextAnswer,
  toAttemptAutosaveStorageKey,
  toggleAttemptMarkedForReview,
  toggleAttemptMultiSelectAnswer,
  type AttemptAutosaveStatus,
  type AttemptAutosaveTone,
  type AttemptSubmissionState,
  type AttemptSubmissionTone,
} from "../../../../../modules/attempts";

type StudentAttemptPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
  alignContent: "start",
  width: "100%",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  padding: "clamp(18px, 3vw, 24px)",
  borderRadius: "26px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
};

const attemptCanvasStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
};

const topBarStyle = (tone: "stable" | "warning" | "critical" | "expired"): CSSProperties => {
  const borderColor =
    tone === "expired"
      ? "rgba(180, 83, 9, 0.45)"
      : tone === "critical"
        ? "rgba(217, 119, 6, 0.4)"
        : tone === "warning"
          ? "rgba(245, 158, 11, 0.35)"
          : "rgba(15, 118, 110, 0.2)";

  return {
    position: "sticky",
    top: "12px",
    zIndex: 20,
    display: "grid",
    gap: "18px",
    padding: "clamp(18px, 3vw, 24px)",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.94)",
    border: `1px solid ${borderColor}`,
    boxShadow: "0 20px 40px rgba(16, 35, 60, 0.12)",
    backdropFilter: "blur(12px)",
  };
};

const topBarRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
};

const statusPillStyle = (
  background: string,
  color: string,
): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: "999px",
  background,
  color,
  fontSize: "0.875rem",
  fontWeight: 600,
});

const timerCardStyle = (
  tone: "stable" | "warning" | "critical" | "expired",
): CSSProperties => {
  if (tone === "expired") {
    return {
      display: "grid",
      gap: "6px",
      padding: "16px 18px",
      borderRadius: "18px",
      background: "rgba(180, 83, 9, 0.12)",
      border: "1px solid rgba(180, 83, 9, 0.22)",
    };
  }

  if (tone === "critical") {
    return {
      display: "grid",
      gap: "6px",
      padding: "16px 18px",
      borderRadius: "18px",
      background: "rgba(217, 119, 6, 0.12)",
      border: "1px solid rgba(217, 119, 6, 0.22)",
    };
  }

  if (tone === "warning") {
    return {
      display: "grid",
      gap: "6px",
      padding: "16px 18px",
      borderRadius: "18px",
      background: "rgba(245, 158, 11, 0.12)",
      border: "1px solid rgba(245, 158, 11, 0.22)",
    };
  }

  return {
    display: "grid",
    gap: "6px",
    padding: "16px 18px",
    borderRadius: "18px",
    background: "rgba(15, 118, 110, 0.08)",
    border: "1px solid rgba(15, 118, 110, 0.16)",
  };
};

const attemptLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  alignItems: "start",
};

const mainColumnStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  minWidth: 0,
};

const sidebarStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  minWidth: 0,
};

const heroStyle = (blocked: boolean): CSSProperties =>
  blocked
    ? {
        ...cardStyle,
        background:
          "linear-gradient(135deg, rgba(148, 64, 14, 0.95) 0%, rgba(120, 53, 15, 0.96) 100%)",
        color: "#fff7ed",
      }
    : {
        ...cardStyle,
        background:
          "linear-gradient(135deg, rgba(16, 35, 60, 0.96) 0%, rgba(29, 71, 109, 0.96) 100%)",
        color: "#f8fafc",
      };

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "16px",
};

const metaCardStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(244, 247, 251, 0.9)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const questionCardStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  padding: "clamp(18px, 4vw, 28px)",
  borderRadius: "28px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
};

const modalBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 40,
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(10px)",
};

const modalCardStyle: CSSProperties = {
  width: "min(720px, 100%)",
  display: "grid",
  gap: "18px",
  padding: "clamp(20px, 4vw, 28px)",
  borderRadius: "28px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 24px 48px rgba(15, 23, 42, 0.24)",
};

const finalStateCardStyle = (
  tone: AttemptSubmissionTone,
): CSSProperties => {
  if (tone === "warning") {
    return {
      ...cardStyle,
      background:
        "linear-gradient(135deg, rgba(146, 64, 14, 0.96) 0%, rgba(180, 83, 9, 0.94) 100%)",
      color: "#fff7ed",
    };
  }

  if (tone === "success") {
    return {
      ...cardStyle,
      background:
        "linear-gradient(135deg, rgba(6, 95, 70, 0.96) 0%, rgba(15, 118, 110, 0.94) 100%)",
      color: "#ecfeff",
    };
  }

  return heroStyle(false);
};

type AttemptAutosaveState = {
  status: AttemptAutosaveStatus;
  lastSavedAt: Date | null;
  recoveredAt: Date | null;
  failureMessage: string | null;
};

const AUTOSAVE_DEBOUNCE_MS = 700;
const SUBMIT_TRANSITION_MS = 900;

const createInitialAutosaveState = (): AttemptAutosaveState => ({
  status: "idle",
  lastSavedAt: null,
  recoveredAt: null,
  failureMessage: null,
});

const formatQuestionOrderList = (questionOrders: readonly number[]): string =>
  questionOrders.length === 0 ? "None" : questionOrders.join(", ");

const getAutosavePillColors = (
  tone: AttemptAutosaveTone,
): {
  background: string;
  color: string;
} => {
  if (tone === "positive") {
    return {
      background: "rgba(15, 118, 110, 0.12)",
      color: "#0f766e",
    };
  }

  if (tone === "warning") {
    return {
      background: "rgba(217, 119, 6, 0.12)",
      color: "#b45309",
    };
  }

  if (tone === "critical") {
    return {
      background: "rgba(180, 83, 9, 0.14)",
      color: "#b45309",
    };
  }

  return {
    background: "rgba(71, 85, 105, 0.12)",
    color: "#334155",
  };
};

const getSubmissionToneColors = (
  tone: AttemptSubmissionTone,
): {
  background: string;
  color: string;
} => {
  if (tone === "success") {
    return {
      background: "rgba(15, 118, 110, 0.12)",
      color: "#0f766e",
    };
  }

  if (tone === "warning") {
    return {
      background: "rgba(180, 83, 9, 0.14)",
      color: "#b45309",
    };
  }

  return {
    background: "rgba(71, 85, 105, 0.12)",
    color: "#334155",
  };
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const getQuestionTypeBadgeStyle = (
  type: string,
): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: "999px",
  background:
    type === "SHORT_TEXT" || type === "LONG_TEXT"
      ? "rgba(14, 116, 144, 0.12)"
      : "rgba(15, 118, 110, 0.12)",
  color:
    type === "SHORT_TEXT" || type === "LONG_TEXT" ? "#0f5f73" : "#0f766e",
  fontSize: "0.875rem",
  fontWeight: 600,
});

const getNavigatorChipStyle = (
  tone: "current" | "marked" | "answered" | "visited" | "unanswered",
): CSSProperties => {
  if (tone === "current") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      width: "42px",
      height: "42px",
      borderRadius: "14px",
      border: "1px solid rgba(15, 118, 110, 0.35)",
      background: "rgba(15, 118, 110, 0.12)",
      color: "#0f766e",
      fontWeight: 700,
    };
  }

  if (tone === "marked") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      width: "42px",
      height: "42px",
      borderRadius: "14px",
      border: "1px solid rgba(217, 119, 6, 0.32)",
      background: "rgba(217, 119, 6, 0.12)",
      color: "#b45309",
      fontWeight: 700,
    };
  }

  if (tone === "answered") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      width: "42px",
      height: "42px",
      borderRadius: "14px",
      border: "1px solid rgba(14, 116, 144, 0.26)",
      background: "rgba(14, 116, 144, 0.12)",
      color: "#0f5f73",
      fontWeight: 700,
    };
  }

  if (tone === "visited") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      width: "42px",
      height: "42px",
      borderRadius: "14px",
      border: "1px solid rgba(71, 85, 105, 0.14)",
      background: "rgba(226, 232, 240, 0.55)",
      color: "#475569",
      fontWeight: 700,
    };
  }

  return {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(16, 35, 60, 0.08)",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 700,
  };
};

export default function StudentAttemptPage({ params }: StudentAttemptPageProps) {
  const { attemptId } = use(params);
  const sessionEntry = useMemo(
    () =>
      resolveAttemptSessionEntry(
        listStudentAttemptBootstrapRecords(),
        attemptId,
        new Date("2026-04-12T10:00:00+05:30"),
      ),
    [attemptId],
  );
  const attemptSession = sessionEntry.session;
  const [workspaceState, setWorkspaceState] = useState(() =>
    attemptSession === null ? null : createAttemptWorkspaceState(attemptSession),
  );
  const [autosaveState, setAutosaveState] = useState<AttemptAutosaveState>(
    createInitialAutosaveState,
  );
  const [submissionState, setSubmissionState] = useState<AttemptSubmissionState>(
    createInitialAttemptSubmissionState,
  );
  const [recoveryReady, setRecoveryReady] = useState(attemptSession === null);
  const autosaveFingerprintRef = useRef<string | null>(null);
  const attemptTimer = useMemo(
    () =>
      attemptSession === null
        ? null
        : buildAttemptTimerViewModel(
            attemptSession.startedAt,
            attemptSession.expiresAt,
            new Date("2026-04-12T10:00:00+05:30"),
          ),
    [attemptSession],
  );

  useEffect(() => {
    if (attemptSession === null) {
      setWorkspaceState(null);
      setAutosaveState(createInitialAutosaveState());
      setSubmissionState(createInitialAttemptSubmissionState());
      setRecoveryReady(true);
      autosaveFingerprintRef.current = null;
      return;
    }

    const baseState = createAttemptWorkspaceState(attemptSession);

    setRecoveryReady(false);
    setWorkspaceState(baseState);
    setAutosaveState(createInitialAutosaveState());
    setSubmissionState(createInitialAttemptSubmissionState());

    if (typeof window === "undefined") {
      autosaveFingerprintRef.current = buildAttemptAutosaveFingerprint(
        attemptSession,
        baseState,
      );
      setRecoveryReady(true);
      return;
    }

    try {
      const storageKey = toAttemptAutosaveStorageKey(attemptSession.attemptId);
      const snapshot = parseAttemptAutosaveSnapshot(
        window.localStorage.getItem(storageKey),
      );
      const recoveredState = recoverAttemptWorkspaceState(
        attemptSession.attemptId,
        attemptSession,
        snapshot,
      );

      setWorkspaceState(recoveredState.state);
      setAutosaveState({
        status: recoveredState.recovered ? "saved" : "idle",
        lastSavedAt: recoveredState.savedAt,
        recoveredAt: recoveredState.recovered ? recoveredState.savedAt : null,
        failureMessage: null,
      });
      autosaveFingerprintRef.current = buildAttemptAutosaveFingerprint(
        attemptSession,
        recoveredState.state,
      );
    } catch (error) {
      const failureMessage =
        error instanceof Error
          ? error.message
          : "Local recovery storage is unavailable in this browser context.";

      setWorkspaceState(baseState);
      setAutosaveState({
        status: "failed",
        lastSavedAt: null,
        recoveredAt: null,
        failureMessage,
      });
      autosaveFingerprintRef.current = buildAttemptAutosaveFingerprint(
        attemptSession,
        baseState,
      );
    } finally {
      setRecoveryReady(true);
    }
  }, [attemptSession]);

  useEffect(() => {
    if (attemptSession === null || attemptTimer?.tone !== "expired") {
      return;
    }

    setSubmissionState((state) =>
      applyAttemptAutoSubmit(state, attemptSession.expiresAt),
    );
  }, [attemptSession, attemptTimer?.tone]);

  useEffect(() => {
    if (
      attemptSession === null ||
      workspaceState === null ||
      !recoveryReady ||
      isAttemptInteractionLocked(submissionState)
    ) {
      return;
    }

    const nextFingerprint = buildAttemptAutosaveFingerprint(
      attemptSession,
      workspaceState,
    );

    if (nextFingerprint === autosaveFingerprintRef.current) {
      return;
    }

    setAutosaveState((state) => ({
      ...state,
      status: "saving",
      failureMessage: null,
    }));

    const timeoutId = window.setTimeout(() => {
      try {
        const savedAt = new Date();
        const snapshot = createAttemptAutosaveSnapshot(
          attemptSession.attemptId,
          attemptSession,
          workspaceState,
          savedAt,
        );

        window.localStorage.setItem(
          toAttemptAutosaveStorageKey(attemptSession.attemptId),
          serializeAttemptAutosaveSnapshot(snapshot),
        );
        autosaveFingerprintRef.current = nextFingerprint;
        setAutosaveState((state) => ({
          ...state,
          status: "saved",
          lastSavedAt: savedAt,
          failureMessage: null,
        }));
      } catch (error) {
        setAutosaveState((state) => ({
          ...state,
          status: "failed",
          failureMessage:
            error instanceof Error
              ? error.message
              : "Local recovery storage is unavailable in this browser context.",
        }));
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [attemptSession, recoveryReady, submissionState, workspaceState]);

  useEffect(() => {
    if (attemptSession === null || submissionState.phase !== "submitting") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmissionState((state) =>
        completeAttemptSubmission(state, new Date()),
      );
    }, SUBMIT_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [attemptSession, submissionState.phase]);

  useEffect(() => {
    if (
      attemptSession === null ||
      workspaceState === null ||
      !isAttemptFinalized(submissionState) ||
      typeof window === "undefined"
    ) {
      return;
    }

    try {
      window.localStorage.removeItem(
        toAttemptAutosaveStorageKey(attemptSession.attemptId),
      );
      autosaveFingerprintRef.current = buildAttemptAutosaveFingerprint(
        attemptSession,
        workspaceState,
      );
    } catch {
      return;
    }
  }, [attemptSession, submissionState, workspaceState]);

  return (
    <div style={pageStyle}>
      {attemptSession === null ? (
        <>
          <section
            style={heroStyle(true)}
            role="status"
            aria-live="polite"
          >
            <span
              style={{
                display: "inline-flex",
                width: "fit-content",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.14)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {sessionEntry.blockReason === "ATTEMPT_NOT_ACTIVE"
                ? "Finished Attempt"
                : "Session Blocked"}
            </span>

            <div style={{ display: "grid", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
                {sessionEntry.title}
              </h2>
              <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7 }}>
                {sessionEntry.message}
              </p>
            </div>
          </section>

          <section style={cardStyle}>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.7 }}>
              {sessionEntry.blockReason === "ATTEMPT_NOT_ACTIVE"
                ? "This exam attempt is already finalized and cannot be reopened for editing. Return to the student dashboard and use the submitted or results surfaces instead of the live runtime."
                : "The attempt route rejected this request because the current session is not active. Return to the student dashboard and use a valid Start or Continue path."}
            </p>
            <a
              href="/student"
              style={{
                display: "inline-flex",
                width: "fit-content",
                padding: "12px 18px",
                borderRadius: "14px",
                background: "rgba(15, 118, 110, 0.1)",
                color: "#0f766e",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Back to Dashboard
            </a>
          </section>
        </>
      ) : (
        workspaceState !== null && (() => {
          const timer = attemptTimer!;
          const currentQuestion =
            attemptSession.questions[workspaceState.currentQuestionIndex]!;
          const currentDraft = workspaceState.drafts[currentQuestion.examQuestionId]!;
          const navigationItems = buildAttemptQuestionNavigationItems(
            attemptSession,
            workspaceState,
          );
          const questionCount = attemptSession.questions.length;
          const answeredCount = navigationItems.filter((item) => item.isAnswered).length;
          const markedCount = navigationItems.filter(
            (item) => item.isMarkedForReview,
          ).length;
          const currentQuestionAnswered = isAttemptQuestionAnswered(currentDraft);
          const submissionSummary = buildAttemptSubmissionSummary(
            attemptSession,
            workspaceState,
          );
          const submissionPresentation = buildAttemptSubmissionPresentation(
            submissionState,
            submissionSummary,
          );
          const submissionColors = getSubmissionToneColors(
            submissionPresentation.tone,
          );
          const submitBusy = isAttemptSubmissionBusy(submissionState);
          const submitFinalized = isAttemptFinalized(submissionState);
          const controlsLocked = submissionState.phase !== "active";
          const autosaveIndicator = buildAttemptAutosaveIndicator(
            autosaveState.status,
            autosaveState.failureMessage,
          );
          const autosaveColors = getAutosavePillColors(autosaveIndicator.tone);
          const autosaveDetail =
            autosaveState.status === "saved" && autosaveState.lastSavedAt !== null
              ? `${autosaveIndicator.detail} Last saved ${formatDateTime(autosaveState.lastSavedAt)}.`
              : autosaveState.status === "saving" && autosaveState.lastSavedAt !== null
                ? `Saving latest changes. Last saved ${formatDateTime(autosaveState.lastSavedAt)}.`
                : autosaveState.recoveredAt !== null
                  ? `${autosaveIndicator.detail} Recovered on entry from the local save at ${formatDateTime(autosaveState.recoveredAt)}.`
                  : autosaveIndicator.detail;

          if (submitFinalized) {
            return (
              <div style={attemptCanvasStyle}>
                <section
                  style={finalStateCardStyle(submissionPresentation.tone)}
                  role="status"
                  aria-live={
                    submissionState.phase === "auto_submitted"
                      ? "assertive"
                      : "polite"
                  }
                >
                  <span
                    style={statusPillStyle(
                      "rgba(255, 255, 255, 0.16)",
                      "#ffffff",
                    )}
                  >
                    {submissionPresentation.statusLabel}
                  </span>

                  <div style={{ display: "grid", gap: "10px" }}>
                    <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
                      {submissionPresentation.title}
                    </h2>
                    <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7 }}>
                      {submissionPresentation.detail}
                    </p>
                  </div>

                  <div style={metaGridStyle}>
                    <div
                      style={{
                        ...metaCardStyle,
                        background: "rgba(255, 255, 255, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        Answered
                      </p>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        {submissionSummary.answeredCount}/{questionCount}
                      </p>
                    </div>

                    <div
                      style={{
                        ...metaCardStyle,
                        background: "rgba(255, 255, 255, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        Unanswered
                      </p>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        {submissionSummary.unansweredCount}
                      </p>
                    </div>

                    <div
                      style={{
                        ...metaCardStyle,
                        background: "rgba(255, 255, 255, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        Finalized
                      </p>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        {submissionState.finalizedAt === null
                          ? "Just now"
                          : formatDateTime(submissionState.finalizedAt)}
                      </p>
                    </div>
                  </div>
                </section>

                <section style={cardStyle}>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                      Final Attempt Summary
                    </h3>
                    <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                      The attempt is now in a stable final state. Further edits and duplicate submit actions are blocked at the UI boundary.
                    </p>
                  </div>

                  <div style={metaGridStyle}>
                    <div style={metaCardStyle}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          color: "#64748b",
                        }}
                      >
                        Unanswered Questions
                      </p>
                      <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                        {formatQuestionOrderList(
                          submissionSummary.unansweredQuestionOrders,
                        )}
                      </p>
                    </div>

                    <div style={metaCardStyle}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          color: "#64748b",
                        }}
                      >
                        Marked for Review
                      </p>
                      <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                        {formatQuestionOrderList(
                          submissionSummary.markedQuestionOrders,
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <a
                      href="/student"
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        padding: "12px 18px",
                        borderRadius: "14px",
                        background: "rgba(15, 118, 110, 0.12)",
                        color: "#0f766e",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Back to Dashboard
                    </a>
                    <span style={statusPillStyle(submissionColors.background, submissionColors.color)}>
                      {submissionState.phase === "auto_submitted"
                        ? "Closed by timeout"
                        : "Closed by submit confirmation"}
                    </span>
                  </div>
                </section>
              </div>
            );
          }

          return (
            <div style={attemptCanvasStyle}>
              <section style={topBarStyle(timer.tone)}>
                <div style={topBarRowStyle}>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                      <span style={statusPillStyle("rgba(15, 118, 110, 0.12)", "#0f766e")}>
                        In Progress
                      </span>
                      <span style={statusPillStyle("rgba(71, 85, 105, 0.12)", "#334155")}>
                        {attemptSession.examCode}
                      </span>
                    </div>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <h2 style={{ margin: 0, fontSize: "1.5rem", lineHeight: 1.15, color: "#10233c" }}>
                        {attemptSession.examTitle}
                      </h2>
                      <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                        Attempt {attemptSession.attemptId} started on{" "}
                        {formatDateTime(attemptSession.startedAt)} and expires at{" "}
                        {timer.expiresAtLabel}.
                      </p>
                    </div>
                  </div>

                  <div style={timerCardStyle(timer.tone)}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#64748b",
                      }}
                    >
                      Time Remaining
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily:
                          '"IBM Plex Mono", "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace',
                        fontSize: "2rem",
                        fontWeight: 700,
                        color:
                          timer.tone === "expired"
                            ? "#92400e"
                            : timer.tone === "critical"
                              ? "#b45309"
                              : timer.tone === "warning"
                                ? "#b45309"
                                : "#0f766e",
                      }}
                    >
                      {timer.remainingLabel}
                    </p>
                    <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>
                      {timer.statusLabel}
                    </p>
                  </div>
                </div>

                <div style={topBarRowStyle}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <span
                      style={statusPillStyle(
                        autosaveColors.background,
                        autosaveColors.color,
                      )}
                    >
                      {autosaveIndicator.label}
                    </span>
                    <span style={statusPillStyle("rgba(15, 23, 42, 0.08)", "#334155")}>
                      {answeredCount}/{questionCount} answered
                    </span>
                    <span style={statusPillStyle("rgba(217, 119, 6, 0.12)", "#b45309")}>
                      {markedCount} marked
                    </span>
                    {autosaveState.recoveredAt !== null ? (
                      <span style={statusPillStyle("rgba(14, 116, 144, 0.12)", "#0f5f73")}>
                        Recovery restored
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
                    role="status"
                    aria-live="polite"
                  >
                    <div style={{ display: "grid", gap: "4px", maxWidth: "520px" }}>
                      <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                        {timer.helperText}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color:
                            autosaveIndicator.tone === "critical"
                              ? "#b45309"
                              : "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        {autosaveDetail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSubmissionState((state) =>
                          openAttemptSubmissionConfirmation(state),
                          )
                      }
                      disabled={submissionState.phase !== "active"}
                      aria-label="Open submit confirmation"
                      style={{
                        padding: "12px 18px",
                        borderRadius: "14px",
                        border: "none",
                        background:
                          submissionState.phase === "active"
                            ? "#10233c"
                            : "rgba(148, 163, 184, 0.18)",
                        color:
                          submissionState.phase === "active"
                            ? "#f8fafc"
                            : "#64748b",
                        fontWeight: 700,
                        cursor:
                          submissionState.phase === "active"
                            ? "pointer"
                            : "not-allowed",
                      }}
                    >
                      Submit Attempt
                    </button>
                  </div>
                </div>
              </section>

              <div style={attemptLayoutStyle}>
                <main style={mainColumnStyle}>
                  <section style={questionCardStyle}>
                    <div style={{ display: "grid", gap: "18px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px" }}>
                        <div style={{ display: "grid", gap: "8px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#64748b",
                            }}
                          >
                            Question {currentQuestion.questionOrder} of {questionCount}
                          </p>
                          <h3 style={{ margin: 0, fontSize: "1.65rem", lineHeight: 1.2, color: "#10233c" }}>
                            {currentQuestion.stem}
                          </h3>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                          <span style={getQuestionTypeBadgeStyle(currentQuestion.type)}>
                            {currentQuestion.type}
                          </span>
                          <span style={statusPillStyle("rgba(15, 23, 42, 0.08)", "#334155")}>
                            {currentQuestion.maxMarks} marks
                          </span>
                          {currentDraft.markedForReview ? (
                            <span style={statusPillStyle("rgba(217, 119, 6, 0.12)", "#b45309")}>
                              Marked for review
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                          {currentQuestionAnswered
                            ? "Local answer state is captured for this question."
                            : "No answer has been entered for this question yet."}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setWorkspaceState((state) =>
                              state === null
                                ? state
                                : toggleAttemptMarkedForReview(
                                    state,
                                    currentQuestion.examQuestionId,
                                  ),
                            )
                          }
                          disabled={controlsLocked}
                          aria-pressed={currentDraft.markedForReview}
                          aria-label={
                            currentDraft.markedForReview
                              ? `Remove question ${currentQuestion.questionOrder} from review`
                              : `Mark question ${currentQuestion.questionOrder} for review`
                          }
                          style={{
                            padding: "12px 16px",
                            borderRadius: "14px",
                            border: "1px solid rgba(217, 119, 6, 0.26)",
                            background: currentDraft.markedForReview
                              ? "rgba(217, 119, 6, 0.14)"
                              : "rgba(255, 255, 255, 0.94)",
                            color: controlsLocked ? "#cbd5e1" : "#b45309",
                            fontWeight: 700,
                            cursor: controlsLocked ? "not-allowed" : "pointer",
                          }}
                        >
                          {currentDraft.markedForReview
                            ? "Unmark Review"
                            : "Mark for Review"}
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "14px",
                          padding: "22px",
                          borderRadius: "22px",
                          background: "rgba(241, 245, 249, 0.72)",
                          border: "1px dashed rgba(15, 118, 110, 0.26)",
                        }}
                      >
                        {currentQuestion.type === "SINGLE_CHOICE" ||
                        currentQuestion.type === "TRUE_FALSE" ? (
                          <div style={{ display: "grid", gap: "12px" }}>
                            {currentQuestion.options?.map((option) => {
                              const isSelected =
                                currentDraft.selectedOptionIds[0] === option.id;

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    setWorkspaceState((state) =>
                                      state === null
                                        ? state
                                        : setAttemptSingleSelectAnswer(
                                            state,
                                            currentQuestion.examQuestionId,
                                            option.id,
                                          ),
                                    )
                                  }
                                  disabled={controlsLocked}
                                  aria-pressed={isSelected}
                                  aria-label={`Select option ${option.label} for question ${currentQuestion.questionOrder}: ${option.text}`}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    gap: "12px",
                                    alignItems: "center",
                                    padding: "14px 16px",
                                    borderRadius: "16px",
                                    background: isSelected
                                      ? "rgba(15, 118, 110, 0.12)"
                                      : "#ffffff",
                                    border: isSelected
                                      ? "1px solid rgba(15, 118, 110, 0.28)"
                                      : "1px solid rgba(16, 35, 60, 0.08)",
                                    cursor: controlsLocked ? "not-allowed" : "pointer",
                                    textAlign: "left",
                                    opacity: controlsLocked ? 0.72 : 1,
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      width: "34px",
                                      height: "34px",
                                      borderRadius: "999px",
                                      background: isSelected
                                        ? "#0f766e"
                                        : "rgba(15, 118, 110, 0.12)",
                                      color: isSelected ? "#f8fafc" : "#0f766e",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {option.label}
                                  </span>
                                  <span style={{ color: "#334155", lineHeight: 1.6 }}>
                                    {option.text}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : currentQuestion.type === "MULTIPLE_CHOICE" ? (
                          <div style={{ display: "grid", gap: "12px" }}>
                            {currentQuestion.options?.map((option) => {
                              const isSelected =
                                currentDraft.selectedOptionIds.includes(option.id);

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    setWorkspaceState((state) =>
                                      state === null
                                        ? state
                                        : toggleAttemptMultiSelectAnswer(
                                            state,
                                            currentQuestion.examQuestionId,
                                            option.id,
                                          ),
                                    )
                                  }
                                  disabled={controlsLocked}
                                  aria-pressed={isSelected}
                                  aria-label={`Toggle option ${option.label} for question ${currentQuestion.questionOrder}: ${option.text}`}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    gap: "12px",
                                    alignItems: "center",
                                    padding: "14px 16px",
                                    borderRadius: "16px",
                                    background: isSelected
                                      ? "rgba(14, 116, 144, 0.12)"
                                      : "#ffffff",
                                    border: isSelected
                                      ? "1px solid rgba(14, 116, 144, 0.24)"
                                      : "1px solid rgba(16, 35, 60, 0.08)",
                                    cursor: controlsLocked ? "not-allowed" : "pointer",
                                    textAlign: "left",
                                    opacity: controlsLocked ? 0.72 : 1,
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      width: "34px",
                                      height: "34px",
                                      borderRadius: "10px",
                                      background: isSelected
                                        ? "#0f5f73"
                                        : "rgba(14, 116, 144, 0.12)",
                                      color: isSelected ? "#f8fafc" : "#0f5f73",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {option.label}
                                  </span>
                                  <span style={{ color: "#334155", lineHeight: 1.6 }}>
                                    {option.text}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <textarea
                            value={currentDraft.textResponse}
                            onChange={(event) =>
                              setWorkspaceState((state) =>
                                state === null
                                  ? state
                                  : setAttemptTextAnswer(
                                      state,
                                      currentQuestion.examQuestionId,
                                      event.target.value,
                                  ),
                              )
                            }
                            disabled={controlsLocked}
                            aria-label={`Response for question ${currentQuestion.questionOrder}`}
                            rows={currentQuestion.type === "LONG_TEXT" ? 10 : 5}
                            placeholder={
                              currentQuestion.type === "LONG_TEXT"
                                ? "Write a fuller structured response here."
                                : "Write a concise answer here."
                            }
                            style={{
                              width: "100%",
                              minHeight:
                                currentQuestion.type === "LONG_TEXT"
                                  ? "240px"
                                  : "160px",
                              padding: "18px",
                              borderRadius: "18px",
                              border: "1px solid rgba(16, 35, 60, 0.12)",
                              background: "#ffffff",
                              color: "#10233c",
                              lineHeight: 1.7,
                              resize: "vertical",
                              font: "inherit",
                              opacity: controlsLocked ? 0.72 : 1,
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
                          Use previous, next, or the navigator rail to move across questions without losing
                          local draft answers.
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkspaceState((state) =>
                                state === null
                                  ? state
                                  : goToPreviousAttemptQuestion(
                                      state,
                                      attemptSession,
                                    ),
                              )
                            }
                            disabled={
                              controlsLocked || workspaceState.currentQuestionIndex === 0
                            }
                            aria-label={`Go to previous question from question ${currentQuestion.questionOrder}`}
                            style={{
                              padding: "12px 18px",
                              borderRadius: "14px",
                              border: "1px solid rgba(15, 118, 110, 0.18)",
                              background:
                                controlsLocked || workspaceState.currentQuestionIndex === 0
                                  ? "rgba(148, 163, 184, 0.12)"
                                  : "#ffffff",
                              color:
                                controlsLocked || workspaceState.currentQuestionIndex === 0
                                  ? "#94a3b8"
                                  : "#0f766e",
                              fontWeight: 700,
                              cursor:
                                controlsLocked || workspaceState.currentQuestionIndex === 0
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkspaceState((state) =>
                                state === null
                                  ? state
                                  : goToNextAttemptQuestion(
                                      state,
                                      attemptSession,
                                    ),
                              )
                            }
                            disabled={
                              controlsLocked ||
                              workspaceState.currentQuestionIndex ===
                              questionCount - 1
                            }
                            aria-label={`Go to next question from question ${currentQuestion.questionOrder}`}
                            style={{
                              padding: "12px 18px",
                              borderRadius: "14px",
                              border: "none",
                              background:
                                controlsLocked ||
                                workspaceState.currentQuestionIndex ===
                                questionCount - 1
                                  ? "rgba(148, 163, 184, 0.12)"
                                  : "#0f766e",
                              color:
                                controlsLocked ||
                                workspaceState.currentQuestionIndex ===
                                questionCount - 1
                                  ? "#94a3b8"
                                  : "#f8fafc",
                              fontWeight: 700,
                              cursor:
                                controlsLocked ||
                                workspaceState.currentQuestionIndex ===
                                questionCount - 1
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>

                <aside id="question-navigation" style={sidebarStyle}>
                  <section style={cardStyle}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                        Question Navigator
                      </h3>
                      <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                        Current, answered, visited, and marked-for-review states stay visible while moving
                        through the attempt.
                      </p>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {navigationItems.map((item, index) => (
                        <button
                          key={item.examQuestionId}
                          type="button"
                          onClick={() =>
                            setWorkspaceState((state) =>
                              state === null
                                ? state
                                : goToAttemptQuestion(
                                    state,
                                    attemptSession,
                                    index,
                                  ),
                            )
                          }
                          disabled={controlsLocked}
                          aria-current={item.isCurrent ? "step" : undefined}
                          aria-label={`Go to question ${item.questionOrder}`}
                          style={{
                            ...getNavigatorChipStyle(item.tone),
                            cursor: controlsLocked ? "not-allowed" : "pointer",
                            opacity: controlsLocked ? 0.72 : 1,
                          }}
                        >
                          {item.questionOrder}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "grid", gap: "10px" }}>
                      {navigationItems.map((item, index) => (
                        <button
                          key={`${item.examQuestionId}-row`}
                          type="button"
                          onClick={() =>
                            setWorkspaceState((state) =>
                              state === null
                                ? state
                                : goToAttemptQuestion(
                                    state,
                                    attemptSession,
                                    index,
                                  ),
                            )
                          }
                          disabled={controlsLocked}
                          aria-label={`Open question ${item.questionOrder} from the navigator`}
                          style={{
                            display: "grid",
                            gap: "4px",
                            padding: "14px 16px",
                            borderRadius: "16px",
                            border: item.isCurrent
                              ? "1px solid rgba(15, 118, 110, 0.22)"
                              : "1px solid rgba(16, 35, 60, 0.08)",
                            background: item.isCurrent
                              ? "rgba(15, 118, 110, 0.08)"
                              : "#ffffff",
                            textAlign: "left",
                            cursor: controlsLocked ? "not-allowed" : "pointer",
                            opacity: controlsLocked ? 0.72 : 1,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: "#10233c" }}>
                            Question {item.questionOrder}
                          </span>
                          <span style={{ color: "#4b647a", lineHeight: 1.5 }}>
                            {item.statusLabel}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div style={metaGridStyle}>
                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Current
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          Question {currentQuestion.questionOrder}
                        </p>
                      </div>

                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Status
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {navigationItems[workspaceState.currentQuestionIndex]?.statusLabel}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section style={cardStyle}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                        Attempt Instructions
                      </h3>
                      <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                        These instructions stay visible next to the live question frame during the timed
                        attempt.
                      </p>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", lineHeight: 1.8 }}>
                      {attemptSession.instructions.map((instruction) => (
                        <li key={instruction}>{instruction}</li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>

              {(submissionState.phase === "confirming" || submitBusy) && (
                <div style={modalBackdropStyle}>
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="attempt-submit-modal-title"
                    aria-describedby="attempt-submit-modal-detail"
                    style={modalCardStyle}
                  >
                    <div style={{ display: "grid", gap: "10px" }}>
                      <span
                        style={statusPillStyle(
                          submissionColors.background,
                          submissionColors.color,
                        )}
                      >
                        {submissionPresentation.statusLabel}
                      </span>
                      <h3
                        id="attempt-submit-modal-title"
                        style={{ margin: 0, fontSize: "1.45rem", color: "#10233c" }}
                      >
                        {submissionPresentation.title}
                      </h3>
                      <p
                        id="attempt-submit-modal-detail"
                        style={{ margin: 0, color: "#4b647a", lineHeight: 1.7 }}
                      >
                        {submissionPresentation.detail}
                      </p>
                    </div>

                    <div style={metaGridStyle}>
                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Answered
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {submissionSummary.answeredCount}/{questionCount}
                        </p>
                      </div>

                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Unanswered
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {submissionSummary.unansweredCount}
                        </p>
                      </div>

                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Marked
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {submissionSummary.markedCount}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Unanswered Questions
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {formatQuestionOrderList(
                            submissionSummary.unansweredQuestionOrders,
                          )}
                        </p>
                      </div>

                      <div style={metaCardStyle}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Marked for Review
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                          {formatQuestionOrderList(
                            submissionSummary.markedQuestionOrders,
                          )}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSubmissionState((state) =>
                            closeAttemptSubmissionConfirmation(state),
                          )
                        }
                        disabled={submitBusy}
                        aria-label="Close submit confirmation and continue reviewing"
                        style={{
                          padding: "12px 18px",
                          borderRadius: "14px",
                          border: "1px solid rgba(16, 35, 60, 0.1)",
                          background: "#ffffff",
                          color: submitBusy ? "#94a3b8" : "#334155",
                          fontWeight: 700,
                          cursor: submitBusy ? "not-allowed" : "pointer",
                        }}
                      >
                        Keep Reviewing
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSubmissionState((state) =>
                            startAttemptSubmission(state),
                          )
                        }
                        disabled={submitBusy}
                        aria-label="Confirm final submit"
                        style={{
                          padding: "12px 18px",
                          borderRadius: "14px",
                          border: "none",
                          background: submitBusy ? "#94a3b8" : "#10233c",
                          color: "#f8fafc",
                          fontWeight: 700,
                          cursor: submitBusy ? "not-allowed" : "pointer",
                        }}
                      >
                        {submitBusy ? "Submitting..." : "Confirm Submit"}
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
