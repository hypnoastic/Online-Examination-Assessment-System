import type { ReactNode } from "react";

import { StudentDashboardShell } from "../../../components/layout/student-dashboard-shell";
import { requireRole } from "@oeas/backend/lib/auth/rbac";

type StudentLayoutProps = {
  children: ReactNode;
};

export default async function StudentLayout({ children }: StudentLayoutProps) {
  await requireRole("STUDENT", "/student");

  return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
