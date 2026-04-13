import type { ReactNode } from "react";

import { DashboardShell } from "./dashboard-shell";

type AdminDashboardShellProps = {
  children: ReactNode;
  activeHref?: string;
  pageTitle?: string;
  pageDescription?: string;
};

const adminNavigation = [
  {
    href: "#overview",
    label: "Overview",
    description: "Operational summary and governance signals",
  },
  {
    href: "#user-operations",
    label: "User Operations",
    description: "Structural slot for user management workflows",
  },
  {
    href: "#audit-activity",
    label: "Audit Activity",
    description: "Preview area for searchable system events",
  },
  {
    href: "#reporting",
    label: "Reporting",
    description: "Placeholder for analytics and reporting detail",
  },
];

export function AdminDashboardShell({
  children,
  activeHref = "#overview",
  pageTitle = "Admin Dashboard",
  pageDescription = "Monitor users, operational activity, audit visibility, and reporting readiness from one admin-only shell.",
}: AdminDashboardShellProps) {
  return (
    <DashboardShell
      roleLabel="Admin"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      navigation={adminNavigation.map((item) => ({
        ...item,
        isActive: item.href === activeHref,
      }))}
    >
      {children}
    </DashboardShell>
  );
}
