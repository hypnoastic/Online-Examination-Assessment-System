import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("STUDENT", routes.studentExams);

export default function StudentExamsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.studentDashboard}
      description={page.description}
      nextSteps={[
        "Assigned exam listings can now land here without changing student navigation or shell structure.",
        "Role checks and breadcrumbs are already handled above this page, so future work can focus on eligibility and status logic.",
        "This destination should become the student entry for available, active, and submitted exams.",
      ]}
      role="STUDENT"
      title={page.title}
    />
  );
}
