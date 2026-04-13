import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/class-names";
import { PageContainer, SurfaceCard } from "@/components/ui/shell-primitives";

type SharedStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  items?: readonly string[];
  layout?: "inline" | "page";
  tone?: "default" | "tint" | "contrast";
  className?: string;
};

type ErrorStateProps = Omit<SharedStateProps, "tone">;
type LoadingStateProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  layout?: "inline" | "page";
  className?: string;
};

function StateLayout({
  children,
  layout,
}: {
  children: ReactNode;
  layout: "inline" | "page";
}) {
  if (layout === "page") {
    return (
      <main className="state-page" id="app-main-content" tabIndex={-1}>
        <PageContainer className="state-page__container" width="wide">
          {children}
        </PageContainer>
      </main>
    );
  }

  return <>{children}</>;
}

function SharedStateCard({
  eyebrow,
  title,
  description,
  actions,
  items,
  layout = "inline",
  tone = "default",
  className,
}: SharedStateProps) {
  return (
    <StateLayout layout={layout}>
      <SurfaceCard className={cn("state-card", className)} tone={tone}>
        <div className="state-card__signal" aria-hidden="true" />
        <div className="state-card__body">
          <p className="state-card__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="state-card__description">{description}</p>

          {items?.length ? (
            <ul className="state-card__list">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {actions ? <div className="state-card__actions">{actions}</div> : null}
      </SurfaceCard>
    </StateLayout>
  );
}

export function EmptyState(props: SharedStateProps) {
  return <SharedStateCard {...props} className={cn("state-card--empty", props.className)} tone={props.tone ?? "tint"} />;
}

export function ErrorState(props: ErrorStateProps) {
  return <SharedStateCard {...props} className={cn("state-card--error", props.className)} tone="default" />;
}

export function NotFoundState({
  layout = "page",
}: {
  layout?: "inline" | "page";
}) {
  return (
    <SharedStateCard
      actions={
        <>
          <Link className="button-link button-link--primary" href="/">
            Back to landing
          </Link>
          <Link className="button-link button-link--secondary" href="/login">
            Go to login
          </Link>
        </>
      }
      description="The page may have moved, the link may be outdated, or you may be looking for a protected area that requires a valid sign-in."
      eyebrow="Not found"
      items={[
        "Use the shared navigation or a safe entry route to continue.",
        "Protected dashboard pages still require the correct signed-in role.",
      ]}
      layout={layout}
      title="This page is not available."
      tone="default"
    />
  );
}

export function LoadingState({
  eyebrow = "Loading",
  title = "Preparing the shared workspace",
  description = "Loading shared navigation, page structure, and session-aware shell state.",
  layout = "inline",
  className,
}: LoadingStateProps) {
  return (
    <StateLayout layout={layout}>
      <SurfaceCard
        aria-busy="true"
        aria-live="polite"
        className={cn("state-card state-card--loading", className)}
        tone="tint"
      >
        <div className="state-card__body">
          <p className="state-card__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="state-card__description">{description}</p>

          <div className="loading-state__chips" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="loading-state__grid" aria-hidden="true">
            <div className="loading-state__panel loading-state__panel--wide" />
            <div className="loading-state__panel" />
            <div className="loading-state__panel" />
          </div>
        </div>
      </SurfaceCard>
    </StateLayout>
  );
}
