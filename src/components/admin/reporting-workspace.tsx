"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import {
  filterAdminReportingKpis,
  filterAdminReportingCharts,
  filterAdminReportingDetails,
  formatAdminReportingKpiValue,
  type AdminReportingExamOption,
  type AdminReportingFilters,
  type AdminReportingKpiRecord,
  type AdminReportingChartRecord,
  type AdminReportingDetailRecord,
} from "../../modules/admin";

type ReportingWorkspaceProps = {
  examOptions: readonly AdminReportingExamOption[];
  kpiRecords: readonly AdminReportingKpiRecord[];
  chartRecords: readonly AdminReportingChartRecord[];
  detailRecords: readonly AdminReportingDetailRecord[];
};

const workspaceStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const toolbarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  alignItems: "end",
};

const inputGroupStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const labelStyle: CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle: CSSProperties = {
  height: "46px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #d5dfea",
  background: "#ffffff",
  color: "#10233c",
  fontSize: "0.95rem",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: "46px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "1px solid #d5dfea",
  background: "#ffffff",
  color: "#10233c",
  fontWeight: 600,
  cursor: "pointer",
};

const kpiGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const kpiCardStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 16px 32px rgba(16, 35, 60, 0.08)",
};

const emptyStateStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "22px",
  borderRadius: "18px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(31, 79, 130, 0.34)",
};

const summaryPanelStyle: CSSProperties = {
  display: "grid",
  gap: "14px",
  padding: "22px",
  borderRadius: "22px",
  background: "rgba(245, 248, 252, 0.96)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};



const sectionTitleStyle: CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#10233c",
  margin: "32px 0 16px 0",
};

const chartContainerStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
  padding: "24px",
  background: "#ffffff",
  borderRadius: "22px",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 16px 32px rgba(16, 35, 60, 0.04)",
};

const tableContainerStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  overflow: "hidden",
  boxShadow: "0 16px 32px rgba(16, 35, 60, 0.04)",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
};

const thStyle: CSSProperties = {
  padding: "16px 20px",
  background: "rgba(245, 248, 252, 0.96)",
  borderBottom: "1px solid rgba(16, 35, 60, 0.08)",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#4b647a",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tdStyle: CSSProperties = {
  padding: "16px 20px",
  borderBottom: "1px solid rgba(16, 35, 60, 0.04)",
  fontSize: "0.95rem",
  color: "#10233c",
};

const statusBadgeStyle = (status: string): CSSProperties => {
  const isCompleted = status === "Completed";
  const isPending = status === "Pending Review";
  return {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.80rem",
    fontWeight: 600,
    background: isCompleted ? "#dcfce7" : isPending ? "#fef3c7" : "#e0e7ff",
    color: isCompleted ? "#166534" : isPending ? "#92400e" : "#3730a3",
  };
};

const barContainerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 40px",
  alignItems: "center",
  gap: "12px",
};

const barTrackStyle: CSSProperties = {
  height: "24px",
  background: "#f1f5f9",
  borderRadius: "12px",
  overflow: "hidden",
};

const barFillStyle = (percentage: number): CSSProperties => ({
  height: "100%",
  width: `${percentage}%`,
  background: "#0f766e",
  borderRadius: "12px",
  transition: "width 0.3s ease",
});

const defaultFilters: Required<AdminReportingFilters> = {
  examId: "ALL",
  startDate: "",
  endDate: "",
};

export function ReportingWorkspace({ examOptions, kpiRecords, chartRecords, detailRecords }: ReportingWorkspaceProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const visibleKpis = useMemo(() => filterAdminReportingKpis(kpiRecords, filters), [kpiRecords, filters]);
  const visibleCharts = useMemo(() => filterAdminReportingCharts(chartRecords, filters), [chartRecords, filters]);
  const visibleDetails = useMemo(() => filterAdminReportingDetails(detailRecords, filters), [detailRecords, filters]);

  const selectedExamLabel =
    examOptions.find((option) => option.examId === filters.examId)?.label ?? "All exams";

  return (
    <div style={workspaceStyle}>
      <div style={toolbarGridStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="exam-filter" style={labelStyle}>
            Exam
          </label>
          <select
            id="exam-filter"
            value={filters.examId}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                examId: event.target.value,
              }))
            }
            style={inputStyle}
          >
            {examOptions.map((option) => (
              <option key={option.examId} value={option.examId}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="report-start-date" style={labelStyle}>
            From
          </label>
          <input
            id="report-start-date"
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                startDate: event.target.value,
              }))
            }
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="report-end-date" style={labelStyle}>
            To
          </label>
          <input
            id="report-end-date"
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                endDate: event.target.value,
              }))
            }
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button type="button" style={secondaryButtonStyle} onClick={() => setFilters(defaultFilters)}>
            Reset Filters
          </button>
        </div>
      </div>

      <div style={summaryPanelStyle}>
        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#64748b" }}>
          Current Reporting Scope
        </p>
        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#10233c" }}>{selectedExamLabel}</p>
        <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
          {filters.startDate || filters.endDate
            ? `Date range: ${filters.startDate || "Any start"} to ${filters.endDate || "Any end"}`
            : "Date range: all available reporting windows"}
        </p>
      </div>

      {visibleKpis.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#10233c" }}>
            No KPI data matches the current reporting filters.
          </p>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Broaden the date range or switch the exam selector to restore reporting coverage. The empty state
            stays explicit so missing KPI cards do not look like a rendering failure.
          </p>
        </div>
      ) : (
        <>
          <section aria-label="Reporting KPI summary cards" style={kpiGridStyle}>
            {visibleKpis.map((record) => (
              <article key={record.id} style={kpiCardStyle}>
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
                  {record.label}
                </p>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#10233c" }}>
                  {formatAdminReportingKpiValue(record)}
                </p>
                <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{record.note}</p>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  Window: {record.rangeStart} to {record.rangeEnd}
                </p>
              </article>
            ))}
          </section>

          {visibleCharts.length > 0 && (
            <div>
              <h3 style={sectionTitleStyle}>Score Distribution</h3>
              <div style={chartContainerStyle}>
                <div style={{ display: "grid", gap: "12px", maxWidth: "600px" }}>
                  {visibleCharts.reduce((acc, chart) => {
                    const existingChart = acc.find(c => c.label === chart.label);
                    if (existingChart) {
                      existingChart.value += chart.value;
                    } else {
                      acc.push({ ...chart });
                    }
                    return acc;
                  }, [] as AdminReportingChartRecord[]).map((chart, idx) => {
                    const totalScore = visibleCharts.reduce((sum, c) => sum + c.value, 0);
                    const percentage = totalScore > 0 ? (chart.value / totalScore) * 100 : 0;
                    return (
                      <div key={idx} style={barContainerStyle}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4b647a" }}>{chart.label}</div>
                        <div style={barTrackStyle}>
                          <div style={barFillStyle(percentage)} />
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10233c", textAlign: "right" }}>{chart.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {visibleDetails.length > 0 && (
            <div>
              <h3 style={sectionTitleStyle}>Recent Submissions</h3>
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Participant</th>
                      <th style={thStyle}>Exam ID</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Score</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDetails.map((detail) => (
                      <tr key={detail.id}>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600 }}>{detail.participantName}</span>
                        </td>
                        <td style={tdStyle}><span style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#64748b" }}>{detail.examId}</span></td>
                        <td style={tdStyle}>{detail.date}</td>
                        <td style={tdStyle}>
                          {detail.score !== null ? (
                            <span style={{ fontWeight: 700 }}>{detail.score}%</span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={statusBadgeStyle(detail.status)}>{detail.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
