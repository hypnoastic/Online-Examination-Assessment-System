"use client";

import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { useId } from "react";

import { DashboardShellToggle } from "@/components/layout/dashboard-shell-toggle";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { PageContainer } from "@/components/ui/shell-primitives";
import { getDashboardNavigation } from "@/lib/dashboard-navigation";

type DashboardShellProps = {
  user: Session["user"] | null;
  headerUtility?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  user,
  headerUtility,
  children,
}: DashboardShellProps) {
  const navigationId = useId();

  if (!user) {
    return (
      <main className="dashboard-shell__content" id="app-main-content" tabIndex={-1}>
        <PageContainer className="dashboard-shell__content-container" width="wide">
          <div className="dashboard-shell__canvas">{children}</div>
        </PageContainer>
      </main>
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
