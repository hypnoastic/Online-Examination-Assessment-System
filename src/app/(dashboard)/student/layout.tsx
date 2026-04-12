import type { ReactNode } from "react";

import { StudentDashboardShell } from "../../../components/layout/student-dashboard-shell";

type StudentLayoutProps = {
  children: ReactNode;
};

export default function StudentLayout({ children }: StudentLayoutProps) {
  return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
