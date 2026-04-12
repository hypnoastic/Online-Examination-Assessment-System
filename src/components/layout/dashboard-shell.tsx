import type { CSSProperties, ReactNode } from "react";

export type DashboardNavigationItem = {
  href: string;
  label: string;
  description: string;
  isActive?: boolean;
};

type DashboardShellProps = {
  roleLabel: string;
  pageTitle: string;
  pageDescription: string;
  navigation: DashboardNavigationItem[];
  children: ReactNode;
};

const shellStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, rgba(244, 247, 251, 0.96) 0%, rgba(234, 240, 247, 0.92) 100%)",
  color: "#102033",
};

const sidebarStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "24px",
  padding: "32px 24px",
  background: "#10233c",
  color: "#f4f8fc",
};

const navListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: 0,
  margin: 0,
  listStyle: "none",
};

const contentStyle: CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto 1fr",
  minWidth: 0,
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  padding: "32px 40px 24px",
  borderBottom: "1px solid rgba(16, 32, 51, 0.08)",
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(12px)",
};

const mainStyle: CSSProperties = {
  padding: "32px 40px 40px",
};

const roleBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(77, 220, 202, 0.14)",
  color: "#9ff3e7",
  fontSize: "0.875rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
};

const headerBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(15, 118, 110, 0.12)",
  color: "#0f766e",
  fontSize: "0.875rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const navLinkStyle = (isActive: boolean): CSSProperties => ({
  display: "grid",
  gap: "4px",
  padding: "14px 16px",
  borderRadius: "18px",
  textDecoration: "none",
  background: isActive ? "rgba(77, 220, 202, 0.14)" : "rgba(255, 255, 255, 0.04)",
  color: "#f4f8fc",
  border: isActive ? "1px solid rgba(77, 220, 202, 0.35)" : "1px solid rgba(255, 255, 255, 0.06)",
});

export function DashboardShell({
  roleLabel,
  pageTitle,
  pageDescription,
  navigation,
  children,
}: DashboardShellProps) {
  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <div style={{ display: "grid", gap: "16px" }}>
          <span style={roleBadgeStyle}>{roleLabel}</span>
          <div style={{ display: "grid", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              Online Examination Assessment System
            </p>
            <p style={{ margin: 0, color: "rgba(244, 248, 252, 0.72)", lineHeight: 1.6 }}>
              Shared dashboard shell for role-aware student, examiner, and admin experiences.
            </p>
          </div>
        </div>

        <nav aria-label="Dashboard navigation">
          <ul style={navListStyle}>
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  style={navLinkStyle(Boolean(item.isActive))}
                  aria-current={item.isActive ? "location" : undefined}
                >
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: "0.925rem", color: "rgba(244, 248, 252, 0.72)" }}>
                    {item.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div style={contentStyle}>
        <header style={headerStyle}>
          <div style={{ display: "grid", gap: "10px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#4b647a",
              }}
            >
              Dashboard / {roleLabel}
            </p>
            <div style={{ display: "grid", gap: "6px" }}>
              <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>{pageTitle}</h1>
              <p style={{ margin: 0, maxWidth: "720px", color: "#4b647a", lineHeight: 1.6 }}>
                {pageDescription}
              </p>
            </div>
          </div>

          <span style={headerBadgeStyle}>Shared Shell Active</span>
        </header>

        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  );
}
