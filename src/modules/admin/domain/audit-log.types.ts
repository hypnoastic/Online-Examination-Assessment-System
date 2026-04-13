export type AdminAuditAction =
  | "USER_CREATED"
  | "ROLE_UPDATED"
  | "STATUS_UPDATED"
  | "EXAM_PUBLISHED"
  | "AUDIT_EXPORT_REQUESTED";

export type AdminAuditEntityType = "USER" | "EXAM" | "REPORT";

export type AdminAuditRecord = {
  id: string;
  actor: string;
  action: AdminAuditAction;
  entity: string;
  entityType: AdminAuditEntityType;
  occurredAt: Date;
  metadata: Record<string, string>;
};

export type AdminAuditFilters = {
  actor?: string;
  action?: AdminAuditAction | "ALL";
  entity?: string;
  startDate?: string;
  endDate?: string;
};
