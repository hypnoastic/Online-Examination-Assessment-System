import type { CSSProperties } from "react";

import {
  findStudentAttemptBootstrapRecordByExamId,
  resolveExamStartEntry,
} from "../../../../../../modules/attempts";

type StudentExamStartPageProps = {
  params: {
    examId: string;
  };
};

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  padding: "28px",
  borderRadius: "28px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
};

const heroStyle = (tone: "ready" | "resume" | "blocked"): CSSProperties => {
  if (tone === "ready") {
    return {
      ...cardStyle,
      background:
        "linear-gradient(135deg, rgba(15, 118, 110, 0.94) 0%, rgba(19, 78, 74, 0.96) 100%)",
      color: "#f8fafc",
    };
  }

  if (tone === "resume") {
    return {
      ...cardStyle,
      background:
        "linear-gradient(135deg, rgba(14, 116, 144, 0.94) 0%, rgba(22, 78, 99, 0.96) 100%)",
      color: "#f8fafc",
    };
  }

  return {
    ...cardStyle,
    background:
      "linear-gradient(135deg, rgba(180, 83, 9, 0.92) 0%, rgba(146, 64, 14, 0.96) 100%)",
    color: "#fffbeb",
  };
};

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const metaCardStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(244, 247, 251, 0.9)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const actionLinkStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: "fit-content",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#0f766e",
  color: "#f8fafc",
  textDecoration: "none",
  fontWeight: 600,
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: "fit-content",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "rgba(15, 118, 110, 0.1)",
  color: "#0f766e",
  textDecoration: "none",
  fontWeight: 600,
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

export default function StudentExamStartPage({
  params,
}: StudentExamStartPageProps) {
  const record = findStudentAttemptBootstrapRecordByExamId(params.examId);
  const startEntry = resolveExamStartEntry(
    record,
    new Date("2026-04-12T10:00:00+05:30"),
  );

  const scheduleWindow =
    record === null
      ? "Unavailable"
      : `${formatDateTime(record.windowStartsAt)} to ${formatDateTime(record.windowEndsAt)}`;

  return (
    <div style={pageStyle}>
      <section style={heroStyle(startEntry.tone)}>
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
          {startEntry.outcome === "BLOCKED"
            ? "Eligibility Check"
            : startEntry.outcome === "RESUME_ACTIVE"
              ? "Attempt Resume"
              : "Attempt Bootstrap"}
        </span>

        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            {startEntry.title}
          </h2>
          <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7 }}>
            {startEntry.message}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {startEntry.actionHref !== null && startEntry.actionLabel !== null ? (
            <a href={startEntry.actionHref} style={actionLinkStyle}>
              {startEntry.actionLabel}
            </a>
          ) : null}
          <a href="/student" style={secondaryLinkStyle}>
            Back to Dashboard
          </a>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            Start Eligibility Context
          </h3>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            The start route applies assignment, schedule, duplicate-attempt, and manual-block checks before
            creating or resuming a student attempt.
          </p>
        </div>

        <div style={metaGridStyle}>
          <div style={metaCardStyle}>
            <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
              Exam
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
              {record === null ? "Unknown exam" : `${record.examTitle} (${record.examCode})`}
            </p>
          </div>

          <div style={metaCardStyle}>
            <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
              Schedule Window
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>{scheduleWindow}</p>
          </div>

          <div style={metaCardStyle}>
            <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
              Blocking Reason
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
              {startEntry.blockReason ?? "Eligible to enter"}
            </p>
          </div>

          <div style={metaCardStyle}>
            <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
              Question Session
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
              {startEntry.session === null
                ? "Not loaded"
                : `${startEntry.session.questionCount} questions ready`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
