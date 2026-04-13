import assert from "node:assert/strict";
import test from "node:test";

import {
  describeAdminAuditAction,
  filterAdminAuditRecords,
  listAdminAuditActors,
  listAdminAuditRecords,
  sortAdminAuditRecords,
} from "../index.ts";

test("admin audit records keep the required row fields stable", () => {
  const records = listAdminAuditRecords();

  assert.equal(records.length >= 1, true);
  assert.deepEqual(Object.keys(records[0] ?? {}).sort(), [
    "action",
    "actor",
    "entity",
    "entityType",
    "id",
    "metadata",
    "occurredAt",
  ]);
});

test("admin audit records sort newest-first for readable table rendering", () => {
  const sorted = sortAdminAuditRecords(listAdminAuditRecords());

  assert.equal(sorted[0]?.id, "audit-001");
  assert.equal(sorted.at(-1)?.id, "audit-005");
});

test("admin audit action labels stay readable for table rows", () => {
  assert.equal(describeAdminAuditAction("USER_CREATED"), "User created");
  assert.equal(describeAdminAuditAction("AUDIT_EXPORT_REQUESTED"), "Audit export requested");
});

test("admin audit filters narrow by actor, action, entity, and date range", () => {
  const records = listAdminAuditRecords();

  assert.deepEqual(
    filterAdminAuditRecords(records, { actor: "abhishek" }).map((record) => record.id),
    ["audit-001", "audit-003", "audit-005"],
  );

  assert.deepEqual(
    filterAdminAuditRecords(records, { action: "EXAM_PUBLISHED" }).map((record) => record.id),
    ["audit-004"],
  );

  assert.deepEqual(
    filterAdminAuditRecords(records, { entity: "priya" }).map((record) => record.id),
    ["audit-002"],
  );

  assert.deepEqual(
    filterAdminAuditRecords(records, {
      startDate: "2026-04-13",
      endDate: "2026-04-13",
    }).map((record) => record.id),
    ["audit-001", "audit-002", "audit-003", "audit-004"],
  );
});

test("admin audit filters can resolve to a clean no-match state", () => {
  const records = listAdminAuditRecords();

  assert.deepEqual(
    filterAdminAuditRecords(records, {
      actor: "nobody",
      action: "ROLE_UPDATED",
    }),
    [],
  );
});

test("admin audit actors stay available for filter controls", () => {
  assert.deepEqual(listAdminAuditActors(listAdminAuditRecords()), ["Abhishek Rana", "Meera Joshi"]);
});
