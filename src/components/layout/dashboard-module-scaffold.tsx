import Link from "next/link";

import { PageHeader, PageToolbar } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/fallback-states";
import { SurfaceCard } from "@/components/ui/shell-primitives";
import type { AppRole } from "@/modules/auth/types";

type DashboardModuleScaffoldProps = {
  role: AppRole;
  title: string;
  description: string;
  backHref: string;
  nextSteps: string[];
};

export function DashboardModuleScaffold({
  role,
  title,
  description,
  backHref,
  nextSteps,
}: DashboardModuleScaffoldProps) {
  return (
    <div className="dashboard-module-scaffold">
      <SurfaceCard>
        <PageHeader
          actions={
            <PageToolbar align="end">
              <Link className="button-link button-link--secondary" href={backHref}>
                Back to overview
              </Link>
            </PageToolbar>
          }
          description={description}
          eyebrow={`${role} module`}
          title={title}
        />
      </SurfaceCard>

      <EmptyState
        actions={
          <PageToolbar>
            <Link className="button-link button-link--secondary" href={backHref}>
              Back to overview
            </Link>
          </PageToolbar>
        }
        description="The route, header, breadcrumbs, and shared shell are ready. Feature owners can now land real content here without rebuilding the page structure."
        eyebrow="Empty state baseline"
        items={nextSteps}
        title="No module content is connected yet."
      />
    </div>
  );
}
