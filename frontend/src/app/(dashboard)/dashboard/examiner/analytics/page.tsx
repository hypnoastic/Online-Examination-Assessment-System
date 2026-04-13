import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("EXAMINER", routes.examinerAnalytics);

export default function ExaminerAnalyticsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.examinerDashboard}
      description={page.description}
      nextSteps={[
        "Examiner analytics now has its own route so reporting work does not overload the overview or grading screens.",
        "Feature owners can extend this destination with charts and publishing insights while preserving shared shell behavior.",
        "This page should stay focused on exam performance and result-readiness signals rather than authoring actions.",
      ]}
      role="EXAMINER"
      title={page.title}
    />
  );
}
