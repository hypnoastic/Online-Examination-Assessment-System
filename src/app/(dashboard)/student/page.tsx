import type { CSSProperties } from "react";

import { AssignedExamList } from "../../../components/student/assigned-exam-list";
import {
  buildAssignedExamListViewModel,
  listStudentAssignedExamRecords,
  summarizeAssignedExamList,
} from "../../../modules/attempts";

const heroStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  padding: "28px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #13304d 0%, #1d476d 55%, #256d85 100%)",
  color: "#f7fbfd",
  boxShadow: "0 24px 48px rgba(16, 35, 60, 0.12)",
};

const heroBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255, 255, 255, 0.14)",
  fontSize: "0.875rem",
  fontWeight: 600,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const metricCardStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(255, 255, 255, 0.88)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 36px rgba(16, 35, 60, 0.08)",
};

const sectionCardStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  padding: "24px",
  borderRadius: "26px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
};

const placeholderStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(37, 109, 133, 0.36)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  lineHeight: 1.2,
};

export default function StudentDashboardPage() {
  const assignedExamRecords = listStudentAssignedExamRecords();
  const assignedExamItems = buildAssignedExamListViewModel(assignedExamRecords);
  const assignedExamSummary = summarizeAssignedExamList(assignedExamItems);
  const metrics = [
    {
      label: "Assigned Exams",
      value: String(assignedExamSummary.total),
      note: "Every row belongs to the signed-in student and keeps action language stable.",
    },
    {
      label: "Action Ready",
      value: String(assignedExamSummary.actionableCount),
      note: "Start and Continue rows stay at the top so the next student action is easy to spot.",
    },
    {
      label: "Locked",
      value: String(assignedExamSummary.lockedCount),
      note: "Upcoming, blocked, or closed exams remain visible with readable eligibility messaging.",
    },
    {
      label: "Submitted",
      value: String(assignedExamSummary.submittedCount),
      note: "Closed attempts stay non-reopenable and wait for later result publication prompts.",
    },
  ];

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section id="overview" style={heroStyle}>
        <span style={heroBadgeStyle}>Assigned Exam Queue</span>
        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            Assigned exams now map to stable student actions.
          </h2>
          <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7, color: "rgba(247, 251, 253, 0.86)" }}>
            The dashboard now lists assigned exams with clear Start, Continue, Locked, and Submitted states.
            Actionable rows stay prominent, while locked and closed rows explain why the student cannot enter
            a new attempt yet.
          </p>
        </div>
      </section>

      <section aria-label="Student dashboard metrics" style={metricGridStyle}>
        {metrics.map((metric) => (
          <article key={metric.label} style={metricCardStyle}>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#4b647a",
              }}
            >
              {metric.label}
            </p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#10233c" }}>{metric.value}</p>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{metric.note}</p>
          </article>
        ))}
      </section>

      <article id="assigned-exams" style={sectionCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h2 style={sectionTitleStyle}>Assigned Exams</h2>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Status-aware exam rows keep action language stable and expose the correct student entry point for
            each assignment.
          </p>
        </div>

        <AssignedExamList exams={assignedExamItems} />
      </article>

      <article id="results-summary" style={sectionCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h2 style={sectionTitleStyle}>Results Summary</h2>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Published result highlights remain a separate section so submitted attempts do not imply immediate
            result visibility.
          </p>
        </div>

        <div style={placeholderStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>Published result summaries land here later.</p>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Step 2 keeps result display shallow while the assigned exam list focuses on clear action states
            and non-actionable locked or submitted messaging.
          </p>
        </div>
      </article>
    </div>
  );
}
