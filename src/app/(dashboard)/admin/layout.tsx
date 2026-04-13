import type { ReactNode } from "react";

import { AdminDashboardShell } from "../../../components/layout/admin-dashboard-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
