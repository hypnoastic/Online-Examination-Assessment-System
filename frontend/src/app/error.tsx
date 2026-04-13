"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PageToolbar } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/fallback-states";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      actions={
        <PageToolbar>
          <button className="button-link button-link--primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button-link button-link--secondary" href="/">
            Back to landing
          </Link>
        </PageToolbar>
      }
      description="Something interrupted the current view. You can retry safely or return to a stable entry point."
      eyebrow="Application error"
      items={[
        "Shared fallbacks should recover cleanly without trapping the user in a broken screen.",
        "If the issue persists, return to a safe route and try the workflow again.",
      ]}
      layout="page"
      title="The page could not be rendered."
    />
  );
}
