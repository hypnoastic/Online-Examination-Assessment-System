import type { ReactNode } from "react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardSessionPanel } from "@/modules/auth/components/dashboard-session-panel";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  return (
    <DashboardShell>
      <DashboardSessionPanel session={session} />
      {children}
    </DashboardShell>
  );
}
