import type { CSSProperties } from "react";

import type { AssignedExamListItemViewModel } from "../../modules/attempts";

type AssignedExamListProps = {
  exams: readonly AssignedExamListItemViewModel[];
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
};

const rowStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(247, 250, 252, 0.9)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "12px",
};

const metaCardStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const emptyStateStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "24px",
  borderRadius: "22px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(37, 109, 133, 0.36)",
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const getStatusStyle = (
  tone: AssignedExamListItemViewModel["statusTone"],
): CSSProperties => {
  switch (tone) {
    case "ready":
      return {
        background: "rgba(15, 118, 110, 0.12)",
        color: "#0f766e",
      };
    case "active":
      return {
        background: "rgba(8, 145, 178, 0.12)",
        color: "#0f5f73",
      };
    case "locked":
      return {
        background: "rgba(217, 119, 6, 0.12)",
        color: "#b45309",
      };
    case "completed":
      return {
        background: "rgba(71, 85, 105, 0.12)",
        color: "#334155",
      };
  }
};

const getActionStyle = (
  item: AssignedExamListItemViewModel,
): CSSProperties => {
  if (item.action.disabled) {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "120px",
      padding: "12px 16px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: 600,
      background: "rgba(148, 163, 184, 0.12)",
      color: "#64748b",
      pointerEvents: "none",
    };
  }

  if (item.statusTone === "active") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "120px",
      padding: "12px 16px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: 600,
      background: "#0f5f73",
      color: "#f8fafc",
    };
  }

  if (item.statusTone === "locked") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "120px",
      padding: "12px 16px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: 600,
      background: "rgba(217, 119, 6, 0.14)",
      color: "#b45309",
    };
  }

  return {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "120px",
    padding: "12px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 600,
    background: "#0f766e",
    color: "#f8fafc",
  };
};

export function AssignedExamList({ exams }: AssignedExamListProps) {
  if (exams.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
          No assigned exams are visible right now.
        </p>
        <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.7 }}>
          New exam assignments will appear here with clear Start or Continue actions once they become
          available inside the student schedule window.
        </p>
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {exams.map((exam) => (
        <article key={exam.assignmentId} style={rowStyle}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.2 }}>{exam.examTitle}</h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    ...getStatusStyle(exam.statusTone),
                  }}
                >
                  {exam.statusLabel}
                </span>
              </div>

              <p style={{ margin: 0, color: "#4b647a", fontWeight: 600 }}>{exam.examCode}</p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{exam.helperText}</p>
            </div>

            {exam.action.href !== null ? (
              <a href={exam.action.href} style={getActionStyle(exam)}>
                {exam.action.label}
              </a>
            ) : (
              <span aria-disabled="true" style={getActionStyle(exam)}>
                {exam.action.label}
              </span>
            )}
          </div>

          <div style={metaGridStyle}>
            <div style={metaCardStyle}>
              <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                Availability Window
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: "#10233c", lineHeight: 1.5 }}>
                {formatDateTime(exam.windowStartsAt)} to {formatDateTime(exam.windowEndsAt)}
              </p>
            </div>

            <div style={metaCardStyle}>
              <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                Duration
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: "#10233c" }}>{exam.durationMinutes} minutes</p>
            </div>

            <div style={metaCardStyle}>
              <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                Action State
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: "#10233c" }}>{exam.action.label}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
