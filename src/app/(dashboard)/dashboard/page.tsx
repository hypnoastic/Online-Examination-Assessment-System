import { PlaceholderPanel } from "@/components/ui/placeholder-panel";

export default function DashboardEntryPage() {
  return (
    <PlaceholderPanel
      eyebrow="Dashboard entry"
      title="Authenticated workspace route exists structurally."
      description="This is the shared dashboard handoff page. Protection, role redirects, role-aware navigation, and real dashboard content arrive in later prompts."
      items={[
        "Route group lives under src/app/(dashboard)",
        "Shared authenticated shell is already reserved",
        "Module owners can target /dashboard without creating a competing app frame",
      ]}
    />
  );
}
