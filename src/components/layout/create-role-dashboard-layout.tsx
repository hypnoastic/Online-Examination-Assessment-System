import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/rbac";
import type { AppRole } from "@/modules/auth/types";

type RoleDashboardLayoutProps = {
  children: ReactNode;
};

export function createRoleDashboardLayout(role: AppRole, pathname: string) {
  return async function RoleDashboardLayout({
    children,
  }: RoleDashboardLayoutProps) {
    await requireRole(role, pathname);

    return children;
  };
}
