import type { ReactNode } from "react";

import { AdminDashboardShell } from "../../../components/layout/admin-dashboard-shell";
import { requireRole } from "@/lib/auth/rbac";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireRole("ADMIN", "/admin");

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
