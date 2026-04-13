import { LoadingState } from "@/components/ui/fallback-states";

export default function DashboardLoading() {
  return (
    <LoadingState
      description="Loading role-aware navigation, breadcrumbs, and the current dashboard canvas."
      title="Preparing the dashboard"
    />
  );
}
