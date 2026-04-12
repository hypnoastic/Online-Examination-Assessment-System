import type { CSSProperties } from "react";

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

const sectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
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

const metrics = [
  {
    label: "Assigned Exams",
    value: "--",
    note: "Step 2 will connect the status-aware list and actions.",
  },
  {
    label: "Active Attempts",
    value: "--",
    note: "Step 3 and Step 4 will wire resume and attempt entry.",
  },
  {
    label: "Published Results",
    value: "--",
    note: "Later prompts will fill this summary from student results.",
  },
];

export default function StudentDashboardPage() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section id="overview" style={heroStyle}>
        <span style={heroBadgeStyle}>Structural Dashboard Entry</span>
        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            Shared shell wiring is ready for the student flow.
          </h2>
          <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7, color: "rgba(247, 251, 253, 0.86)" }}>
            This route establishes the student dashboard inside the common shell and reserves the primary
            entry sections for assigned exams and published result summaries without introducing deep data
            behavior yet.
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

      <section style={sectionGridStyle}>
        <article id="assigned-exams" style={sectionCardStyle}>
          <div style={{ display: "grid", gap: "8px" }}>
            <h2 style={sectionTitleStyle}>Assigned Exams</h2>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              Landing space for the student exam list, status chips, and clear start or continue entry points.
            </p>
          </div>

          <div style={placeholderStyle}>
            <p style={{ margin: 0, fontWeight: 600 }}>Placeholder ready for assigned exam cards.</p>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              The next prompt can wire list states such as Start, Continue, Locked, and Submitted into this
              section without changing the shell structure.
            </p>
          </div>
        </article>

        <article id="results-summary" style={sectionCardStyle}>
          <div style={{ display: "grid", gap: "8px" }}>
            <h2 style={sectionTitleStyle}>Results Summary</h2>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              Reserved area for published result highlights and compact student-facing performance summaries.
            </p>
          </div>

          <div style={placeholderStyle}>
            <p style={{ margin: 0, fontWeight: 600 }}>Placeholder ready for result summary cards.</p>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              Later result work can attach published status, score snapshots, and summary messaging here
              without restructuring the route entry page.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
