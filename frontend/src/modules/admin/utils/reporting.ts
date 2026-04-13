import type {
  AdminReportingExamOption,
  AdminReportingFilters,
  AdminReportingKpiRecord,
  AdminReportingChartRecord,
  AdminReportingDetailRecord,
} from "../domain/reporting.types";

export const listAdminReportingExamOptions = (): AdminReportingExamOption[] => [
  { examId: "ALL", label: "All exams" },
  { examId: "dbms-midterm", label: "Database Systems Midterm" },
  { examId: "algo-final", label: "Algorithms Final" },
  { examId: "network-lab", label: "Networks Lab Assessment" },
];

export const listAdminReportingKpiRecords = (): AdminReportingKpiRecord[] => [
  {
    id: "kpi-001",
    examId: "dbms-midterm",
    label: "Attempts Started",
    value: 182,
    unit: "count",
    note: "Students who entered the exam workspace during the selected reporting window.",
    rangeStart: "2026-04-01",
    rangeEnd: "2026-04-30",
  },
  {
    id: "kpi-002",
    examId: "dbms-midterm",
    label: "Completion Rate",
    value: 91,
    unit: "percent",
    note: "Share of started attempts that reached submission without reopening the session.",
    rangeStart: "2026-04-01",
    rangeEnd: "2026-04-30",
  },
  {
    id: "kpi-003",
    examId: "dbms-midterm",
    label: "Average Score",
    value: 74,
    unit: "percent",
    note: "Current mean score across published records for the selected exam and date range.",
    rangeStart: "2026-04-01",
    rangeEnd: "2026-04-30",
  },
  {
    id: "kpi-004",
    examId: "dbms-midterm",
    label: "Pending Reviews",
    value: 12,
    unit: "count",
    note: "Manual evaluation items still waiting for final review or publication approval.",
    rangeStart: "2026-04-01",
    rangeEnd: "2026-04-30",
  },
  {
    id: "kpi-005",
    examId: "algo-final",
    label: "Attempts Started",
    value: 164,
    unit: "count",
    note: "Students who entered the exam workspace during the selected reporting window.",
    rangeStart: "2026-03-01",
    rangeEnd: "2026-03-31",
  },
  {
    id: "kpi-006",
    examId: "algo-final",
    label: "Completion Rate",
    value: 88,
    unit: "percent",
    note: "Share of started attempts that reached submission without reopening the session.",
    rangeStart: "2026-03-01",
    rangeEnd: "2026-03-31",
  },
  {
    id: "kpi-007",
    examId: "algo-final",
    label: "Average Score",
    value: 69,
    unit: "percent",
    note: "Current mean score across published records for the selected exam and date range.",
    rangeStart: "2026-03-01",
    rangeEnd: "2026-03-31",
  },
  {
    id: "kpi-008",
    examId: "algo-final",
    label: "Pending Reviews",
    value: 18,
    unit: "count",
    note: "Manual evaluation items still waiting for final review or publication approval.",
    rangeStart: "2026-03-01",
    rangeEnd: "2026-03-31",
  },
  {
    id: "kpi-009",
    examId: "network-lab",
    label: "Attempts Started",
    value: 96,
    unit: "count",
    note: "Students who entered the exam workspace during the selected reporting window.",
    rangeStart: "2026-02-01",
    rangeEnd: "2026-02-28",
  },
  {
    id: "kpi-010",
    examId: "network-lab",
    label: "Completion Rate",
    value: 94,
    unit: "percent",
    note: "Share of started attempts that reached submission without reopening the session.",
    rangeStart: "2026-02-01",
    rangeEnd: "2026-02-28",
  },
  {
    id: "kpi-011",
    examId: "network-lab",
    label: "Average Score",
    value: 81,
    unit: "percent",
    note: "Current mean score across published records for the selected exam and date range.",
    rangeStart: "2026-02-01",
    rangeEnd: "2026-02-28",
  },
  {
    id: "kpi-012",
    examId: "network-lab",
    label: "Pending Reviews",
    value: 4,
    unit: "count",
    note: "Manual evaluation items still waiting for final review or publication approval.",
    rangeStart: "2026-02-01",
    rangeEnd: "2026-02-28",
  },
];

const parseBoundary = (value?: string, boundary?: "start" | "end"): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(
    boundary === "end" ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`,
  );

  return Number.isNaN(timestamp) ? null : timestamp;
};

export const listAdminReportingChartData = (): AdminReportingChartRecord[] => [
  { examId: "dbms-midterm", label: "0-40%", value: 5 },
  { examId: "dbms-midterm", label: "41-60%", value: 15 },
  { examId: "dbms-midterm", label: "61-80%", value: 45 },
  { examId: "dbms-midterm", label: "81-100%", value: 26 },
  { examId: "algo-final", label: "0-40%", value: 12 },
  { examId: "algo-final", label: "41-60%", value: 25 },
  { examId: "algo-final", label: "61-80%", value: 38 },
  { examId: "algo-final", label: "81-100%", value: 13 },
  { examId: "network-lab", label: "0-40%", value: 2 },
  { examId: "network-lab", label: "41-60%", value: 8 },
  { examId: "network-lab", label: "61-80%", value: 52 },
  { examId: "network-lab", label: "81-100%", value: 32 },
];

export const listAdminReportingDetailRecords = (): AdminReportingDetailRecord[] => [
  { id: "dr-001", examId: "dbms-midterm", participantName: "Alice Smith", status: "Completed", score: 85, date: "2026-04-12" },
  { id: "dr-002", examId: "dbms-midterm", participantName: "Bob Jones", status: "Pending Review", score: null, date: "2026-04-14" },
  { id: "dr-003", examId: "algo-final", participantName: "Charlie Brown", status: "Completed", score: 92, date: "2026-03-22" },
  { id: "dr-004", examId: "algo-final", participantName: "Diana Prince", status: "In Progress", score: null, date: "2026-03-31" },
  { id: "dr-005", examId: "network-lab", participantName: "Evan Wright", status: "Completed", score: 76, date: "2026-02-18" },
  { id: "dr-006", examId: "dbms-midterm", participantName: "Fiona Gallagher", status: "Completed", score: 64, date: "2026-04-10" },
  { id: "dr-007", examId: "network-lab", participantName: "George Mason", status: "Pending Review", score: null, date: "2026-02-28" },
];

export const filterAdminReportingKpis = (
  records: readonly AdminReportingKpiRecord[],
  filters: AdminReportingFilters = {},
): AdminReportingKpiRecord[] => {
  const startBoundary = parseBoundary(filters.startDate, "start");
  const endBoundary = parseBoundary(filters.endDate, "end");

  return records.filter((record) => {
    if (filters.examId && filters.examId !== "ALL" && record.examId !== filters.examId) {
      return false;
    }

    const recordStart = parseBoundary(record.rangeStart, "start");
    const recordEnd = parseBoundary(record.rangeEnd, "end");

    if (startBoundary !== null && recordEnd !== null && recordEnd < startBoundary) {
      return false;
    }

    if (endBoundary !== null && recordStart !== null && recordStart > endBoundary) {
      return false;
    }

    return true;
  });
};

export const filterAdminReportingCharts = (
  records: readonly AdminReportingChartRecord[],
  filters: AdminReportingFilters = {},
): AdminReportingChartRecord[] => {
  return records.filter((record) => {
    if (filters.examId && filters.examId !== "ALL" && record.examId !== filters.examId) {
      return false;
    }
    return true;
  });
};

export const filterAdminReportingDetails = (
  records: readonly AdminReportingDetailRecord[],
  filters: AdminReportingFilters = {},
): AdminReportingDetailRecord[] => {
  const startBoundary = parseBoundary(filters.startDate, "start");
  const endBoundary = parseBoundary(filters.endDate, "end");

  return records.filter((record) => {
    if (filters.examId && filters.examId !== "ALL" && record.examId !== filters.examId) {
      return false;
    }

    const recordDate = parseBoundary(record.date, "start");

    if (startBoundary !== null && recordDate !== null && recordDate < startBoundary) {
      return false;
    }

    if (endBoundary !== null && recordDate !== null && recordDate > endBoundary) {
      return false;
    }

    return true;
  });
};

export const formatAdminReportingKpiValue = (record: AdminReportingKpiRecord): string =>
  record.unit === "percent" ? `${record.value}%` : String(record.value);
