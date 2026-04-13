import type {
  AdminAuditAction,
  AdminAuditFilters,
  AdminAuditRecord,
} from "../domain/audit-log.types";

export const listAdminAuditRecords = (): AdminAuditRecord[] => [
  {
    id: "audit-001",
    actor: "Abhishek Rana",
    action: "USER_CREATED",
    entity: "Isha Nair",
    entityType: "USER",
    occurredAt: new Date("2026-04-13T10:12:00.000Z"),
    metadata: {
      invitedBy: "Abhishek Rana",
      destination: "Faculty onboarding queue",
      roleAssigned: "EXAMINER",
    },
  },
  {
    id: "audit-002",
    actor: "Meera Joshi",
    action: "ROLE_UPDATED",
    entity: "Priya Singh",
    entityType: "USER",
    occurredAt: new Date("2026-04-13T09:48:00.000Z"),
    metadata: {
      previousRole: "STUDENT",
      nextRole: "EXAMINER",
      justification: "Escalated for mock evaluation training",
    },
  },
  {
    id: "audit-003",
    actor: "Abhishek Rana",
    action: "STATUS_UPDATED",
    entity: "Sonia Malhotra",
    entityType: "USER",
    occurredAt: new Date("2026-04-13T09:31:00.000Z"),
    metadata: {
      previousStatus: "INACTIVE",
      nextStatus: "ACTIVE",
      source: "Manual reactivation from admin dashboard",
    },
  },
  {
    id: "audit-004",
    actor: "Meera Joshi",
    action: "EXAM_PUBLISHED",
    entity: "Database Systems Midterm",
    entityType: "EXAM",
    occurredAt: new Date("2026-04-13T08:54:00.000Z"),
    metadata: {
      examSession: "DBMS-MID-2026-04",
      publishedAudience: "Semester 4",
      publicationMode: "Immediate release",
    },
  },
  {
    id: "audit-005",
    actor: "Abhishek Rana",
    action: "AUDIT_EXPORT_REQUESTED",
    entity: "Weekly Governance Summary",
    entityType: "REPORT",
    occurredAt: new Date("2026-04-12T16:22:00.000Z"),
    metadata: {
      exportFormat: "CSV",
      requestedWindow: "2026-04-06 to 2026-04-12",
      deliveryChannel: "Admin downloads queue",
    },
  },
];

export const sortAdminAuditRecords = (
  records: readonly AdminAuditRecord[],
): AdminAuditRecord[] =>
  [...records].sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

const normalizeValue = (value?: string): string => value?.trim().toLowerCase() ?? "";

const parseDateBoundary = (value?: string, boundary?: "start" | "end"): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(
    boundary === "end" ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`,
  );

  return Number.isNaN(timestamp) ? null : timestamp;
};

export const filterAdminAuditRecords = (
  records: readonly AdminAuditRecord[],
  filters: AdminAuditFilters = {},
): AdminAuditRecord[] => {
  const actor = normalizeValue(filters.actor);
  const entity = normalizeValue(filters.entity);
  const startBoundary = parseDateBoundary(filters.startDate, "start");
  const endBoundary = parseDateBoundary(filters.endDate, "end");

  return sortAdminAuditRecords(
    records.filter((record) => {
      if (actor.length > 0 && !record.actor.toLowerCase().includes(actor)) {
        return false;
      }

      if (filters.action && filters.action !== "ALL" && record.action !== filters.action) {
        return false;
      }

      if (entity.length > 0 && !record.entity.toLowerCase().includes(entity)) {
        return false;
      }

      const occurredAt = record.occurredAt.getTime();

      if (startBoundary !== null && occurredAt < startBoundary) {
        return false;
      }

      if (endBoundary !== null && occurredAt > endBoundary) {
        return false;
      }

      return true;
    }),
  );
};

export const listAdminAuditActors = (records: readonly AdminAuditRecord[]): string[] =>
  [...new Set(records.map((record) => record.actor))].sort((left, right) => left.localeCompare(right));

export const describeAdminAuditAction = (action: AdminAuditAction): string => {
  switch (action) {
    case "USER_CREATED":
      return "User created";
    case "ROLE_UPDATED":
      return "Role updated";
    case "STATUS_UPDATED":
      return "Status updated";
    case "EXAM_PUBLISHED":
      return "Exam published";
    case "AUDIT_EXPORT_REQUESTED":
      return "Audit export requested";
  }
};
