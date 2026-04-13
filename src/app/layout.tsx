import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Examination Assessment System",
  description:
    "Role-aware online examination platform foundation with shared auth, navigation, and dashboard shell patterns.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#app-main-content">
          Skip to main content
        </a>
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}
