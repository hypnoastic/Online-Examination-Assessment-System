import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("ADMIN", routes.adminAudit);

export default function AdminAuditPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.adminDashboard}
      description={page.description}
      nextSteps={[
        "Audit features can now target this stable Admin route without changing dashboard structure or access checks.",
        "Top-level breadcrumbs and active navigation are already wired for deeper Admin oversight pages.",
        "Future work here should focus on event visibility, search, and filters rather than shell concerns.",
      ]}
      role="ADMIN"
      title={page.title}
    />
  );
}
