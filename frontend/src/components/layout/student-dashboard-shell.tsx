import type { ReactNode } from "react";

import { StaticDashboardShell } from "./dashboard-shell";

type StudentDashboardShellProps = {
  children: ReactNode;
  activeHref?: string;
  pageTitle?: string;
  pageDescription?: string;
};

const studentNavigation = [
  {
    href: "#overview",
    label: "Overview",
    description: "Student dashboard entry point",
  },
  {
    href: "#assigned-exams",
    label: "Assigned Exams",
    description: "Structural slot for exam actions",
  },
  {
    href: "#results-summary",
    label: "Results Summary",
    description: "Placeholder for published result highlights",
  },
];

export function StudentDashboardShell({
  children,
  activeHref = "#overview",
  pageTitle = "Student Dashboard",
  pageDescription = "Track assigned exams, active attempts, and published results from one shared student shell.",
}: StudentDashboardShellProps) {
  return (
    <StaticDashboardShell
      roleLabel="Student"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      navigation={studentNavigation.map((item) => ({
        ...item,
        isActive: item.href === activeHref,
      }))}
    >
      {children}
    </StaticDashboardShell>
  );
}
