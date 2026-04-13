import { LoadingState } from "@/components/ui/fallback-states";

export default function RootLoading() {
  return (
    <LoadingState
      description="Loading the shared application shell, route groups, and authentication-aware entry state."
      layout="page"
      title="Preparing the platform"
    />
  );
}
