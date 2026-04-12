import type { CSSProperties } from "react";

import {
  listStudentAttemptBootstrapRecords,
  resolveAttemptSessionEntry,
} from "../../../../../modules/attempts";

type StudentAttemptPageProps = {
  params: {
    attemptId: string;
  };
};

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
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
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(247, 250, 252, 0.9)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

export default function StudentAttemptPage({ params }: StudentAttemptPageProps) {
  const sessionEntry = resolveAttemptSessionEntry(
    listStudentAttemptBootstrapRecords(),
    params.attemptId,
    new Date("2026-04-12T10:00:00+05:30"),
  );

  return (
    <div style={pageStyle}>
      <section style={heroStyle(sessionEntry.status === "BLOCKED")}>
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
          {sessionEntry.status === "BLOCKED"
            ? "Session Blocked"
            : "Question Session Loaded"}
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

      {sessionEntry.session === null ? (
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
      ) : (
        <>
          <section style={cardStyle}>
            <div style={{ display: "grid", gap: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                Attempt Bootstrap Summary
              </h3>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                The attempt route has loaded the question session and established the minimum structure needed
                for the timed exam layout in the next prompt.
              </p>
            </div>

            <div style={metaGridStyle}>
              <div style={metaCardStyle}>
                <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  Exam
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                  {sessionEntry.session.examTitle} ({sessionEntry.session.examCode})
                </p>
              </div>

              <div style={metaCardStyle}>
                <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  Attempt ID
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                  {sessionEntry.session.attemptId}
                </p>
              </div>

              <div style={metaCardStyle}>
                <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  Started At
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                  {formatDateTime(sessionEntry.session.startedAt)}
                </p>
              </div>

              <div style={metaCardStyle}>
                <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b" }}>
                  Expires At
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                  {formatDateTime(sessionEntry.session.expiresAt)}
                </p>
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={{ display: "grid", gap: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                Instructions
              </h3>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                These instructions are loaded with the question session so the exam route has the data it
                needs before the timer bar and full navigation UI arrive in Step 4.
              </p>
            </div>

            <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", lineHeight: 1.7 }}>
              {sessionEntry.session.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </section>

          <section style={cardStyle}>
            <div style={{ display: "grid", gap: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                Question Session Outline
              </h3>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                Questions are loaded in display order and ready for the timed attempt screen.
              </p>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {sessionEntry.session.questions.map((question) => (
                <article key={question.examQuestionId} style={questionCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>
                      Question {question.questionOrder}
                    </p>
                    <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
                      {question.type} • {question.maxMarks} marks
                    </p>
                  </div>
                  <p style={{ margin: 0, color: "#334155", lineHeight: 1.7 }}>
                    {question.stem}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
