import assert from "node:assert/strict";
import test from "node:test";

import {
  filterAdminReportingKpis,
  formatAdminReportingKpiValue,
  listAdminReportingExamOptions,
  listAdminReportingKpiRecords,
} from "../index";

test("admin reporting options include a stable all-exams selector", () => {
  const options = listAdminReportingExamOptions();

  assert.equal(options[0]?.examId, "ALL");
  assert.equal(options.length >= 2, true);
});

test("admin reporting filters narrow records by exam and date range", () => {
  const records = listAdminReportingKpiRecords();

  assert.deepEqual(
    filterAdminReportingKpis(records, { examId: "dbms-midterm" }).map((record) => record.id),
    ["kpi-001", "kpi-002", "kpi-003", "kpi-004"],
  );

  assert.deepEqual(
    filterAdminReportingKpis(records, {
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    }).map((record) => record.id),
    ["kpi-001", "kpi-002", "kpi-003", "kpi-004"],
  );
});

test("admin reporting filters can resolve to a clean no-data state", () => {
  const records = listAdminReportingKpiRecords();

  assert.deepEqual(
    filterAdminReportingKpis(records, {
      examId: "dbms-midterm",
      startDate: "2027-01-01",
      endDate: "2027-01-31",
    }),
    [],
  );
});

test("admin reporting KPI values stay readable for cards", () => {
  const percentRecord = listAdminReportingKpiRecords().find((record) => record.id === "kpi-002");
  const countRecord = listAdminReportingKpiRecords().find((record) => record.id === "kpi-001");

  assert.equal(percentRecord ? formatAdminReportingKpiValue(percentRecord) : "", "91%");
  assert.equal(countRecord ? formatAdminReportingKpiValue(countRecord) : "", "182");
});
