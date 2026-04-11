import Link from "next/link";

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <PlaceholderPanel
      eyebrow="Login route"
      title="Authentication entry page is reserved."
      description="The route, shell, and placeholder structure are ready for the dedicated login UI shell and the later credentials/session implementation prompts."
      items={[
        "Shared auth layout wraps every route in src/app/(auth)",
        "No submission logic is wired in this step",
        "Protected-route behavior is intentionally deferred",
      ]}
    >
      <Link href={routes.home}>Back to landing</Link>
    </PlaceholderPanel>
  );
}
