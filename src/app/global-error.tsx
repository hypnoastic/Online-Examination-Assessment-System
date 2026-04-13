"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PageToolbar } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/fallback-states";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorState
          actions={
            <PageToolbar>
              <button
                className="button-link button-link--primary"
                onClick={reset}
                type="button"
              >
                Reload shell
              </button>
              <Link className="button-link button-link--secondary" href="/">
                Back to landing
              </Link>
            </PageToolbar>
          }
          description="A top-level application failure interrupted the shared shell. Reload the shell or return to a safe route."
          eyebrow="Global error"
          items={[
            "This screen is reserved for unrecoverable layout or root rendering failures.",
            "The recovery path should stay direct, calm, and consistent with the rest of the app.",
          ]}
          layout="page"
          title="The application shell failed to load."
        />
      </body>
    </html>
  );
}
