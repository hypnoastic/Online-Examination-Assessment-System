"use client";

import type { Session } from "next-auth";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";
import { usePathname } from "next/navigation";

import { DashboardShellToggle } from "@/components/layout/dashboard-shell-toggle";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { PageContainer } from "@/components/ui/shell-primitives";
import { getDashboardNavigation } from "@/lib/dashboard-navigation";

export type DashboardNavigationItem = {
  href: string;
  label: string;
  description: string;
  isActive?: boolean;
};

type DashboardShellProps = {
  user: Session["user"] | null;
  headerUtility?: ReactNode;
  children: ReactNode;
};

type StaticDashboardShellProps = {
  roleLabel: string;
  pageTitle: string;
  pageDescription: string;
  navigation: DashboardNavigationItem[];
  children: ReactNode;
};

const staticShellStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, rgba(244, 247, 251, 0.96) 0%, rgba(234, 240, 247, 0.92) 100%)",
  color: "#102033",
};

const staticSidebarStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "24px",
  padding: "32px 24px",
  background: "#10233c",
  color: "#f4f8fc",
};

const staticNavListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: 0,
  margin: 0,
  listStyle: "none",
};

const staticContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto 1fr",
  minWidth: 0,
};

const staticHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  padding: "32px 40px 24px",
  borderBottom: "1px solid rgba(16, 32, 51, 0.08)",
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(12px)",
};

const staticMainStyle: CSSProperties = {
  padding: "32px 40px 40px",
};

const staticRoleBadgeStyle: CSSProperties = {
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

const staticHeaderBadgeStyle: CSSProperties = {
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

const staticNavLinkStyle = (isActive: boolean): CSSProperties => ({
  display: "grid",
  gap: "4px",
  padding: "14px 16px",
  borderRadius: "18px",
  textDecoration: "none",
  background: isActive ? "rgba(77, 220, 202, 0.14)" : "rgba(255, 255, 255, 0.04)",
  color: "#f4f8fc",
  border: isActive
    ? "1px solid rgba(77, 220, 202, 0.35)"
    : "1px solid rgba(255, 255, 255, 0.06)",
});

export function DashboardShell({
  user,
  headerUtility,
  children,
}: DashboardShellProps) {
  const navigationId = useId();
  const pathname = usePathname();
  const isLegacyModuleRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/student");

  if (!user) {
    return (
      <main className="dashboard-shell__content" id="app-main-content" tabIndex={-1}>
        <PageContainer className="dashboard-shell__content-container" width="wide">
          <div className="dashboard-shell__canvas">{children}</div>
        </PageContainer>
      </main>
    );
  }

  if (isLegacyModuleRoute) {
    return (
      <div id="app-main-content" tabIndex={-1}>
        {children}
      </div>
    );
  }

  const navigation = getDashboardNavigation(user.role);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-shell__sidebar dashboard-shell__sidebar--desktop">
        <div className="dashboard-shell__sidebar-frame">
          <div className="dashboard-shell__brand">
            <p className="shell-eyebrow shell-eyebrow--inverse">
              {navigation.shellEyebrow}
            </p>
            <h1>{navigation.shellTitle}</h1>
            <p>{navigation.shellDescription}</p>
          </div>

          <div className="dashboard-shell__identity">
            <span className="dashboard-shell__identity-role">
              {navigation.roleLabel}
            </span>
            <div className="dashboard-shell__identity-copy">
              <p>{user.name}</p>
              <span>{user.email}</span>
            </div>
          </div>

          <DashboardSidebarNav id={navigationId} role={user.role} />
        </div>
      </aside>

      <main className="dashboard-shell__content" id="app-main-content" tabIndex={-1}>
        <PageContainer className="dashboard-shell__content-container" width="wide">
          <header className="dashboard-shell__topbar">
            <div className="dashboard-shell__topbar-main">
              <DashboardShellToggle user={user} />
              <DashboardTopbar role={user.role} />
            </div>
            {headerUtility ? (
              <div className="dashboard-shell__utility">{headerUtility}</div>
            ) : null}
          </header>

          <div className="dashboard-shell__canvas">{children}</div>
        </PageContainer>
      </main>
    </div>
  );
}

export function StaticDashboardShell({
  roleLabel,
  pageTitle,
  pageDescription,
  navigation,
  children,
}: StaticDashboardShellProps) {
  return (
    <div style={staticShellStyle}>
      <aside style={staticSidebarStyle}>
        <div style={{ display: "grid", gap: "16px" }}>
          <span style={staticRoleBadgeStyle}>{roleLabel}</span>
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
          <ul style={staticNavListStyle}>
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  style={staticNavLinkStyle(Boolean(item.isActive))}
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

      <div style={staticContentStyle}>
        <header style={staticHeaderStyle}>
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

          <span style={staticHeaderBadgeStyle}>Shared Shell Active</span>
        </header>

        <main style={staticMainStyle}>{children}</main>
      </div>
    </div>
  );
}
