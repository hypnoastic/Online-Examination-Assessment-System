"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import {
  describeAdminAuditAction,
  filterAdminAuditRecords,
  listAdminAuditActors,
  type AdminAuditFilters,
  type AdminAuditRecord,
} from "../../modules/admin";

type AuditLogWorkspaceProps = {
  records: readonly AdminAuditRecord[];
};

const workspaceStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const toolbarStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
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

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "end",
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

const workspaceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 0.95fr)",
  gap: "18px",
  alignItems: "start",
};

const tableWrapperStyle: CSSProperties = {
  overflowX: "auto",
  borderRadius: "20px",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  background: "#ffffff",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
};

const headerCellStyle: CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "0.82rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#475569",
  background: "#f5f8fc",
  borderBottom: "1px solid rgba(16, 35, 60, 0.08)",
  whiteSpace: "nowrap",
};

const rowButtonStyle = (isActive: boolean): CSSProperties => ({
  width: "100%",
  border: "none",
  padding: 0,
  background: isActive ? "rgba(15, 118, 110, 0.06)" : "transparent",
  cursor: "pointer",
});

const cellStyle: CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(16, 35, 60, 0.08)",
  verticalAlign: "top",
};

const actionBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(15, 118, 110, 0.12)",
  color: "#0f766e",
  fontSize: "0.84rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const entityBadgeStyle = (entityType: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: "999px",
  background:
    entityType === "USER"
      ? "rgba(31, 79, 130, 0.12)"
      : entityType === "EXAM"
        ? "rgba(180, 83, 9, 0.12)"
        : "rgba(3, 105, 161, 0.12)",
  color: entityType === "USER" ? "#1f4f82" : entityType === "EXAM" ? "#b45309" : "#0369a1",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.03em",
});

const emptyStateStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "22px",
  borderRadius: "18px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(31, 79, 130, 0.34)",
};

const detailPanelStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
  padding: "22px",
  borderRadius: "22px",
  background: "rgba(245, 248, 252, 0.96)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  position: "sticky",
  top: "32px",
};

const metadataListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
};

const metadataRowStyle: CSSProperties = {
  display: "grid",
  gap: "4px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#ffffff",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const defaultFilters: Required<AdminAuditFilters> = {
  actor: "",
  action: "ALL",
  entity: "",
  startDate: "",
  endDate: "",
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

export function AuditLogWorkspace({ records }: AuditLogWorkspaceProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const actors = useMemo(() => listAdminAuditActors(records), [records]);
  const filteredRecords = useMemo(() => filterAdminAuditRecords(records, filters), [records, filters]);
  const [selectedId, setSelectedId] = useState<string>(filteredRecords[0]?.id ?? records[0]?.id ?? "");

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedId) ?? filteredRecords[0] ?? null;

  const handleFilterChange = <K extends keyof AdminAuditFilters>(key: K, value: Required<AdminAuditFilters>[K]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div style={workspaceStyle}>
      <form style={toolbarStyle}>
        <div style={toolbarGridStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="actor" style={labelStyle}>
              Actor
            </label>
            <select
              id="actor"
              value={filters.actor}
              onChange={(event) => handleFilterChange("actor", event.target.value)}
              style={inputStyle}
            >
              <option value="">All actors</option>
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="action" style={labelStyle}>
              Action
            </label>
            <select
              id="action"
              value={filters.action}
              onChange={(event) => handleFilterChange("action", event.target.value as Required<AdminAuditFilters>["action"])}
              style={inputStyle}
            >
              <option value="ALL">All actions</option>
              <option value="USER_CREATED">User created</option>
              <option value="ROLE_UPDATED">Role updated</option>
              <option value="STATUS_UPDATED">Status updated</option>
              <option value="EXAM_PUBLISHED">Exam published</option>
              <option value="AUDIT_EXPORT_REQUESTED">Audit export requested</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="entity" style={labelStyle}>
              Entity
            </label>
            <input
              id="entity"
              value={filters.entity}
              onChange={(event) => handleFilterChange("entity", event.target.value)}
              placeholder="Filter by entity name"
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="start-date" style={labelStyle}>
              From
            </label>
            <input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(event) => handleFilterChange("startDate", event.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="end-date" style={labelStyle}>
              To
            </label>
            <input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(event) => handleFilterChange("endDate", event.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setFilters(defaultFilters);
                setSelectedId(records[0]?.id ?? "");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </form>

      <div style={workspaceGridStyle}>
        <div>
          {filteredRecords.length === 0 ? (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#10233c" }}>
                No audit events match the current filters.
              </p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                Adjust the actor, action, entity, or date range filters to widen the result set. The no-match
                state stays explicit so admins do not confuse a filtered view with an empty audit system.
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Actor</th>
                    <th style={headerCellStyle}>Action</th>
                    <th style={headerCellStyle}>Entity</th>
                    <th style={headerCellStyle}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <button
                          type="button"
                          style={rowButtonStyle(record.id === selectedRecord?.id)}
                          onClick={() => setSelectedId(record.id)}
                        >
                          <table style={tableStyle}>
                            <tbody>
                              <tr>
                                <td style={cellStyle}>
                                  <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>{record.actor}</p>
                                </td>
                                <td style={cellStyle}>
                                  <span style={actionBadgeStyle}>{describeAdminAuditAction(record.action)}</span>
                                </td>
                                <td style={cellStyle}>
                                  <div style={{ display: "grid", gap: "8px" }}>
                                    <span style={entityBadgeStyle(record.entityType)}>{record.entityType}</span>
                                    <p style={{ margin: 0, color: "#10233c", lineHeight: 1.5 }}>{record.entity}</p>
                                  </div>
                                </td>
                                <td style={cellStyle}>
                                  <p style={{ margin: 0, color: "#334155", whiteSpace: "nowrap" }}>
                                    {formatDateTime(record.occurredAt)}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside style={detailPanelStyle}>
          {selectedRecord ? (
            <>
              <div style={{ display: "grid", gap: "10px" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#4b647a" }}>
                  Metadata Detail
                </p>
                <h3 style={{ margin: 0, fontSize: "1.2rem", lineHeight: 1.2, color: "#10233c" }}>
                  {describeAdminAuditAction(selectedRecord.action)}
                </h3>
                <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                  {selectedRecord.actor} affected {selectedRecord.entity} on {formatDateTime(selectedRecord.occurredAt)}.
                </p>
              </div>

              <div style={metadataListStyle}>
                {Object.entries(selectedRecord.metadata).map(([key, value]) => (
                  <div key={key} style={metadataRowStyle}>
                    <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#64748b" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p style={{ margin: 0, color: "#10233c", lineHeight: 1.5 }}>{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#10233c" }}>
                No detail to display.
              </p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                When a filtered audit event is available, its metadata appears here in a readable detail panel.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
