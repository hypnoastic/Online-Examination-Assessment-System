import Link from "next/link";

import { PageToolbar } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/fallback-states";
import { routes } from "@oeas/backend/lib/routes";

export default function DashboardRouteNotFound() {
  return (
    <EmptyState
      actions={
        <PageToolbar>
          <Link className="button-link button-link--primary" href={routes.dashboard}>
            Back to dashboard
          </Link>
          <Link className="button-link button-link--secondary" href={routes.home}>
            Back to landing
          </Link>
        </PageToolbar>
      }
      description="The shared dashboard shell is available, but this destination is not part of the current role-aware route structure."
      eyebrow="Dashboard not found"
      items={[
        "Use the sidebar or breadcrumbs to move back to a valid role destination.",
        "New dashboard pages should be added through the shared route map and shell contracts.",
      ]}
      title="This dashboard page is not available."
    />
  );
}
