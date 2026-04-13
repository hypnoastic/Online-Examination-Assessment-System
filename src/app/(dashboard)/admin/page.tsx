import type { CSSProperties } from "react";

import { UserManagementTable } from "../../../components/admin/user-management-table";
import {
  listAdminUserRecords,
  type AdminUserListFilters,
  type AdminUserRole,
  type AdminUserStatus,
} from "../../../modules/admin";

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

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "16px",
};

const metricCardStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
  boxShadow: "0 16px 32px rgba(16, 35, 60, 0.08)",
};

const dashboardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(300px, 1fr)",
  gap: "20px",
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

const subGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const panelStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(245, 248, 252, 0.96)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: 0,
  margin: 0,
  listStyle: "none",
};

const listItemStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(234, 241, 247, 0.8)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const placeholderStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(31, 79, 130, 0.34)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  lineHeight: 1.2,
};

const parseRoleFilter = (value?: string): AdminUserRole | "ALL" => {
  if (value === "ADMIN" || value === "EXAMINER" || value === "STUDENT") {
    return value;
  }

  return "ALL";
};

const parseStatusFilter = (value?: string): AdminUserStatus | "ALL" => {
  if (value === "ACTIVE" || value === "INACTIVE") {
    return value;
  }

  return "ALL";
};

const metrics = [
  {
    label: "Total Users",
    value: "1,284",
    note: "Headcount placeholder for Admin, Examiner, and Student account oversight.",
  },
  {
    label: "Active Exams",
    value: "18",
    note: "Live operational signal reserved for current exam monitoring.",
  },
  {
    label: "Pending Reviews",
    value: "42",
    note: "Review backlog preview that later reporting prompts can deepen.",
  },
  {
    label: "Audit Alerts",
    value: "7",
    note: "Sensitive-event attention area for later audit filtering and drill-down.",
  },
];

const recentActivity = [
  {
    title: "User provisioning queue",
    detail: "New account invitations, activation changes, and role updates will surface here.",
    tone: "Teal-ready placeholder",
  },
  {
    title: "Exam operations watchlist",
    detail: "Operational exceptions can later connect active exams, closures, and publication gates.",
    tone: "Navy governance placeholder",
  },
  {
    title: "Audit event preview",
    detail: "Recent sensitive actions are staged here before the dedicated audit listing arrives.",
    tone: "Amber attention placeholder",
  },
];

type AdminDashboardPageProps = {
  searchParams?: {
    q?: string;
    role?: string;
    status?: string;
  };
};

export default function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const filters: Required<AdminUserListFilters> = {
    query: searchParams?.q?.trim() ?? "",
    role: parseRoleFilter(searchParams?.role),
    status: parseStatusFilter(searchParams?.status),
  };
  const allUsers = listAdminUserRecords();

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section id="overview" style={heroStyle}>
        <span style={heroBadgeStyle}>Admin-Only Operations</span>
        <div style={{ display: "grid", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
            Governance, activity, and reporting now have a dedicated admin entry point.
          </h2>
          <p style={{ margin: 0, maxWidth: "780px", lineHeight: 1.7, color: "rgba(248, 251, 253, 0.88)" }}>
            This dashboard establishes the operational shell for user management, audit visibility, and
            reporting work. The user list now supports name or email search, role filtering, status filtering,
            and a readable empty state without leaving the shared admin route.
          </p>
        </div>
      </section>

      <section aria-label="Admin operational metrics" style={metricGridStyle}>
        {metrics.map((metric) => (
          <article key={metric.label} style={metricCardStyle}>
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
              {metric.label}
            </p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#10233c" }}>{metric.value}</p>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{metric.note}</p>
          </article>
        ))}
      </section>

      <section style={dashboardGridStyle}>
        <article id="user-operations" style={sectionCardStyle}>
          <div style={{ display: "grid", gap: "8px" }}>
            <h2 style={sectionTitleStyle}>User Management</h2>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              Admins can create or invite users, update role assignments, toggle active or inactive status,
              and keep search and filters inside the same working area.
            </p>
          </div>

          <UserManagementTable initialUsers={allUsers} initialFilters={filters} />
        </article>

        <aside id="audit-activity" style={sectionCardStyle}>
          <div style={{ display: "grid", gap: "8px" }}>
            <h2 style={sectionTitleStyle}>Recent Operational Activity</h2>
            <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
              Activity panels stay focused on governance signals so admins can understand what needs attention
              before diving into user records, audit filters, or reporting pages.
            </p>
          </div>

          <ul style={listStyle}>
            {recentActivity.map((item) => (
              <li key={item.title} style={listItemStyle}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>{item.title}</p>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: "rgba(15, 118, 110, 0.1)",
                      color: "#0f766e",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.tone}
                  </span>
                </div>
                <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{item.detail}</p>
              </li>
            ))}
          </ul>

          <div style={subGridStyle}>
            <div style={panelStyle}>
              <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>Role Distribution</p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                Chart-ready slot for Admin, Examiner, and Student population trends.
              </p>
            </div>

            <div style={panelStyle}>
              <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>Account Actions</p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                User create, update, activate, and deactivate workflows plug into this area in later prompts.
              </p>
            </div>

            <div style={panelStyle}>
              <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>Pending Review Signals</p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                Operational bottlenecks remain visible here before detailed analytics and reporting land.
              </p>
            </div>

            <div style={panelStyle}>
              <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>System Health Notes</p>
              <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
                A stable placeholder for publication readiness, closure exceptions, and other admin-facing flags.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <article id="reporting" style={sectionCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h2 style={sectionTitleStyle}>Reporting And Analytics Readiness</h2>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            This structural section keeps reporting inside the same admin language while leaving charts and
            drill-down views for the later analytics prompts.
          </p>
        </div>

        <div style={placeholderStyle}>
          <p style={{ margin: 0, fontWeight: 600, color: "#10233c" }}>
            KPI summaries, trend charts, and report detail views attach here in later steps.
          </p>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            The route, navigation, and panel hierarchy are in place now so future admin work can stay scoped to
            users, audit visibility, and reporting content instead of reshaping the dashboard frame.
          </p>
        </div>
      </article>
    </div>
  );
}
