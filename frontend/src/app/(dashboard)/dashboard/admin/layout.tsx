import { createRoleDashboardLayout } from "@/components/layout/create-role-dashboard-layout";
import { routes } from "@oeas/backend/lib/routes";

export default createRoleDashboardLayout("ADMIN", routes.adminDashboard);
