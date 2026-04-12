"use client";

import { useEffect, useState, type CSSProperties } from "react";

import {
  buildAttemptTimerViewModel,
  buildAttemptQuestionNavigationItems,
  createAttemptWorkspaceState,
  goToAttemptQuestion,
  goToNextAttemptQuestion,
  goToPreviousAttemptQuestion,
  isAttemptQuestionAnswered,
  listStudentAttemptBootstrapRecords,
  resolveAttemptSessionEntry,
  setAttemptSingleSelectAnswer,
  setAttemptTextAnswer,
  toggleAttemptMarkedForReview,
  toggleAttemptMultiSelectAnswer,
} from "../../../../../modules/attempts";

type StudentAttemptPageProps = {
  params: {
    attemptId: string;
  };
};

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
  alignContent: "start",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  padding: "24px",
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
    top: "16px",
    zIndex: 20,
    display: "grid",
    gap: "18px",
    padding: "22px 24px",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
  padding: "28px",
  borderRadius: "28px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
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
  const now = new Date("2026-04-12T10:00:00+05:30");
  const sessionEntry = resolveAttemptSessionEntry(
    listStudentAttemptBootstrapRecords(),
    params.attemptId,
    now,
  );
  const [workspaceState, setWorkspaceState] = useState(() =>
    sessionEntry.session === null
      ? null
      : createAttemptWorkspaceState(sessionEntry.session),
  );

  useEffect(() => {
    if (sessionEntry.session === null) {
      setWorkspaceState(null);
      return;
    }

    setWorkspaceState(createAttemptWorkspaceState(sessionEntry.session));
  }, [sessionEntry.session?.attemptId]);

  return (
    <div style={pageStyle}>
      {sessionEntry.session === null ? (
        <>
          <section style={heroStyle(true)}>
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
              Session Blocked
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
              The attempt route rejected this request because the current session is not active. Return to the
              student dashboard and use a valid Start or Continue path.
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
          const timer = buildAttemptTimerViewModel(
            sessionEntry.session.startedAt,
            sessionEntry.session.expiresAt,
            now,
          );
          const currentQuestion =
            sessionEntry.session.questions[workspaceState.currentQuestionIndex]!;
          const currentDraft = workspaceState.drafts[currentQuestion.examQuestionId]!;
          const navigationItems = buildAttemptQuestionNavigationItems(
            sessionEntry.session,
            workspaceState,
          );
          const questionCount = sessionEntry.session.questions.length;
          const answeredCount = navigationItems.filter((item) => item.isAnswered).length;
          const markedCount = navigationItems.filter(
            (item) => item.isMarkedForReview,
          ).length;
          const currentQuestionAnswered = isAttemptQuestionAnswered(currentDraft);

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
                        {sessionEntry.session.examCode}
                      </span>
                    </div>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <h2 style={{ margin: 0, fontSize: "1.5rem", lineHeight: 1.15, color: "#10233c" }}>
                        {sessionEntry.session.examTitle}
                      </h2>
                      <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                        Attempt {sessionEntry.session.attemptId} started on{" "}
                        {formatDateTime(sessionEntry.session.startedAt)} and expires at{" "}
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
                    <span style={statusPillStyle("rgba(14, 116, 144, 0.12)", "#0f5f73")}>
                      Local draft state
                    </span>
                    <span style={statusPillStyle("rgba(15, 23, 42, 0.08)", "#334155")}>
                      {answeredCount}/{questionCount} answered
                    </span>
                    <span style={statusPillStyle("rgba(217, 119, 6, 0.12)", "#b45309")}>
                      {markedCount} marked
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <p style={{ margin: 0, maxWidth: "520px", color: "#4b647a", lineHeight: 1.6 }}>
                      {timer.helperText}
                    </p>
                    <button
                      type="button"
                      disabled
                      style={{
                        padding: "12px 18px",
                        borderRadius: "14px",
                        border: "none",
                        background: "rgba(148, 163, 184, 0.18)",
                        color: "#64748b",
                        fontWeight: 700,
                        cursor: "not-allowed",
                      }}
                    >
                      Submit Later
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
                          style={{
                            padding: "12px 16px",
                            borderRadius: "14px",
                            border: "1px solid rgba(217, 119, 6, 0.26)",
                            background: currentDraft.markedForReview
                              ? "rgba(217, 119, 6, 0.14)"
                              : "rgba(255, 255, 255, 0.94)",
                            color: "#b45309",
                            fontWeight: 700,
                            cursor: "pointer",
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
                                    cursor: "pointer",
                                    textAlign: "left",
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
                                    cursor: "pointer",
                                    textAlign: "left",
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
                                      sessionEntry.session,
                                    ),
                              )
                            }
                            disabled={workspaceState.currentQuestionIndex === 0}
                            style={{
                              padding: "12px 18px",
                              borderRadius: "14px",
                              border: "1px solid rgba(15, 118, 110, 0.18)",
                              background:
                                workspaceState.currentQuestionIndex === 0
                                  ? "rgba(148, 163, 184, 0.12)"
                                  : "#ffffff",
                              color:
                                workspaceState.currentQuestionIndex === 0
                                  ? "#94a3b8"
                                  : "#0f766e",
                              fontWeight: 700,
                              cursor:
                                workspaceState.currentQuestionIndex === 0
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
                                      sessionEntry.session,
                                    ),
                              )
                            }
                            disabled={
                              workspaceState.currentQuestionIndex ===
                              questionCount - 1
                            }
                            style={{
                              padding: "12px 18px",
                              borderRadius: "14px",
                              border: "none",
                              background:
                                workspaceState.currentQuestionIndex ===
                                questionCount - 1
                                  ? "rgba(148, 163, 184, 0.12)"
                                  : "#0f766e",
                              color:
                                workspaceState.currentQuestionIndex ===
                                questionCount - 1
                                  ? "#94a3b8"
                                  : "#f8fafc",
                              fontWeight: 700,
                              cursor:
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
                                    sessionEntry.session,
                                    index,
                                  ),
                            )
                          }
                          aria-current={item.isCurrent ? "step" : undefined}
                          style={{
                            ...getNavigatorChipStyle(item.tone),
                            cursor: "pointer",
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
                                    sessionEntry.session,
                                    index,
                                  ),
                            )
                          }
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
                            cursor: "pointer",
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
                      {sessionEntry.session.instructions.map((instruction) => (
                        <li key={instruction}>{instruction}</li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
