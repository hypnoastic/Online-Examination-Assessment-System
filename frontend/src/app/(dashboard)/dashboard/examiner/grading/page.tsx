import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("EXAMINER", routes.examinerGrading);

export default function ExaminerGradingPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.examinerDashboard}
      description={page.description}
      nextSteps={[
        "Grading and review flows can now build here without competing with authoring or analytics route structures.",
        "The shared shell already keeps this route distinct inside the Examiner review section.",
        "This destination should own pending review queues, rubric-driven marking, and result-ready handoffs later on.",
      ]}
      role="EXAMINER"
      title={page.title}
    />
  );
}
