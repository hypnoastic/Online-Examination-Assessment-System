import type { CSSProperties } from "react";

import { AuditLogWorkspace } from "../../../../components/admin/audit-log-workspace";
import {
  listAdminAuditRecords,
  sortAdminAuditRecords,
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

export default function AdminAuditLogPage() {
  const records = sortAdminAuditRecords(listAdminAuditRecords());

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <span style={heroBadgeStyle}>Admin Audit Log</span>
        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            Admin event history now has a dedicated listing page.
          </h2>
          <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.7, color: "rgba(248, 251, 253, 0.88)" }}>
            The audit page stays focused on practical review work. Each row surfaces who acted, what changed,
            which entity was affected, and when the event occurred without collapsing density into unreadable
            log output.
          </p>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", lineHeight: 1.2 }}>Audit Events</h2>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            This page remains admin-only by living inside the existing admin dashboard route group and shell.
            Filters narrow by actor, action, entity, and date range, while the adjacent metadata panel keeps
            event detail readable without forcing a separate page transition.
          </p>
        </div>

        <AuditLogWorkspace records={records} />
      </section>
    </div>
  );
}
