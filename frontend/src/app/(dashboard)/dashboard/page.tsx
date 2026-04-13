import { redirect } from "next/navigation";

import { requireAuthenticatedSession, getDashboardRouteForRole } from "@oeas/backend/lib/auth/rbac";

export default async function DashboardEntryPage() {
  const session = await requireAuthenticatedSession();

  redirect(getDashboardRouteForRole(session.user.role));
}
