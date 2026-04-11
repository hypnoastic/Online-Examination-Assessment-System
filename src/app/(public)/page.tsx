import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { routes } from "@/lib/routes";

export default function LandingPage() {
  return (
    <PublicShell>
      <PlaceholderPanel
        eyebrow="Public entry route"
        title="Landing page route is in place for the public experience."
        description="This baseline gives the project a stable home route, a shared shell for future public pages, and a clear handoff point for the dedicated landing-page UI work."
        items={[
          "Public route group lives under src/app/(public)",
          "Visual polish and full landing-page composition land in step 3",
          "Auth and dashboard routes already exist for cross-team coordination",
        ]}
      />
      <PlaceholderPanel
        eyebrow="Application map"
        title="Three route groups are now reserved."
        description="Other owners can build against one routing contract instead of inventing parallel entry structures."
        items={[routes.home, routes.login, routes.dashboard]}
      />
      <div className="panel">
        <p className="panel__eyebrow">Next step for users</p>
        <div className="panel__copy">
          <h2>Authentication entry is available at /login</h2>
          <p>
            Sign-in handling is intentionally deferred until the session and
            authorization prompts. This page only establishes the route and
            shell ownership boundary.
          </p>
        </div>
        <div className="shell__links">
          <Link href={routes.login}>Go to login</Link>
        </div>
      </div>
    </PublicShell>
  );
}
