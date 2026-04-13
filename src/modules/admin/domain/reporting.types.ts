export type AdminReportingExamOption = {
  examId: string;
  label: string;
};

export type AdminReportingKpiRecord = {
  id: string;
  examId: string;
  label: string;
  value: number;
  unit: "count" | "percent";
  note: string;
  rangeStart: string;
  rangeEnd: string;
};

export type AdminReportingFilters = {
  examId?: string;
  startDate?: string;
  endDate?: string;
};

export type AdminReportingChartRecord = {
  examId: string;
  label: string;
  value: number;
};

export type AdminReportingDetailRecord = {
  id: string;
  examId: string;
  participantName: string;
  status: "Completed" | "Pending Review" | "In Progress";
  score: number | null;
  date: string;
};
