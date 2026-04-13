import type { ReactNode } from "react";

import { requireRole } from "@oeas/backend/lib/auth/rbac";
import type { AppRole } from "@oeas/backend/modules/auth/types";

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
