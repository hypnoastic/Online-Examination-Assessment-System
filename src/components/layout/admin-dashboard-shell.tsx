"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { StaticDashboardShell } from "./dashboard-shell";

type AdminDashboardShellProps = {
  children: ReactNode;
  activeHref?: string;
  pageTitle?: string;
  pageDescription?: string;
};

const adminNavigation = [
  {
    href: "/admin",
    label: "Overview",
    description: "Operational summary and governance signals",
  },
  {
    href: "/admin#user-operations",
    label: "User Operations",
    description: "User listing, search, and filter workflows",
  },
  {
    href: "/admin/audit",
    label: "Audit Activity",
    description: "Dedicated listing for admin event history",
  },
  {
    href: "/admin/reporting",
    label: "Reporting",
    description: "KPI summaries and reporting filters",
  },
];

export function AdminDashboardShell({
  children,
  activeHref,
  pageTitle = "Admin Dashboard",
  pageDescription = "Monitor users, operational activity, audit visibility, and reporting readiness from one admin-only shell.",
}: AdminDashboardShellProps) {
  const pathname = usePathname();
  const resolvedActiveHref = activeHref ?? pathname;
  const resolvedPageTitle =
    pathname === "/admin/audit"
      ? "Audit Activity"
      : pathname === "/admin/reporting"
        ? "Reporting"
        : pageTitle;
  const resolvedPageDescription =
    pathname === "/admin/audit"
      ? "Review admin event history, recent operational changes, and system-facing governance actions from one dedicated audit page."
      : pathname === "/admin/reporting"
        ? "Review KPI summaries, exam-level reporting filters, and analytics-ready admin reporting signals from one dedicated page."
      : pageDescription;

  return (
    <StaticDashboardShell
      roleLabel="Admin"
      pageTitle={resolvedPageTitle}
      pageDescription={resolvedPageDescription}
      navigation={adminNavigation.map((item) => ({
        ...item,
        isActive: item.href === resolvedActiveHref,
      }))}
    >
      {children}
    </StaticDashboardShell>
  );
}
