import type { CSSProperties } from "react";

import { ReportingWorkspace } from "../../../../components/admin/reporting-workspace";
import {
  listAdminReportingExamOptions,
  listAdminReportingKpiRecords,
  listAdminReportingChartData,
  listAdminReportingDetailRecords,
} from "../../../../modules/admin";

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "24px",
};

const heroStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  padding: "28px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #102a43 0%, #1f4f82 58%, #0f766e 100%)",
  color: "#f8fbfd",
  boxShadow: "0 24px 48px rgba(16, 35, 60, 0.14)",
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

const sectionCardStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  padding: "24px",
  borderRadius: "26px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 18px 40px rgba(16, 35, 60, 0.08)",
};

export default function AdminReportingPage() {
  const examOptions = listAdminReportingExamOptions();
  const kpiRecords = listAdminReportingKpiRecords();
  const chartRecords = listAdminReportingChartData();
  const detailRecords = listAdminReportingDetailRecords();

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <span style={heroBadgeStyle}>Admin Reporting</span>
        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            KPI reporting now has a dedicated analytics frame.
          </h2>
          <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7, color: "rgba(248, 251, 253, 0.88)" }}>
            The reporting page focuses on summary-layer analytics. KPI cards render from realistic admin
            records, while the primary filter bar keeps exam and date-range state ready for deeper reporting
            work in later steps.
          </p>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", lineHeight: 1.2 }}>KPI Summary</h2>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            This page stays admin-only inside the shared dashboard shell and establishes the reporting frame
            for later charts, exports, and trend views.
          </p>
        </div>

        <ReportingWorkspace
          examOptions={examOptions}
          kpiRecords={kpiRecords}
          chartRecords={chartRecords}
          detailRecords={detailRecords}
        />
      </section>
    </div>
  );
}
