import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("EXAMINER", routes.examinerExams);

export default function ExaminerExamsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.examinerDashboard}
      description={page.description}
      nextSteps={[
        "Exam creation, scheduling, and assignment flows now have a stable top-level destination in the Examiner area.",
        "Route protection and shell conventions are already resolved, so feature work can focus on exam rules and forms.",
        "This page should evolve into the shared entry for draft, scheduled, and active exam management.",
      ]}
      role="EXAMINER"
      title={page.title}
    />
  );
}
