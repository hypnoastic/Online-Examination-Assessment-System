import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Manrope,
} from "next/font/google";
import type { ReactNode } from "react";

import "./tokens.css";
import "./globals.css";

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading-family",
  weight: ["600", "700", "800"],
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body-family",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
  weight: ["500", "600"],
});

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
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      >
        <a className="skip-link" href="#app-main-content">
          Skip to main content
        </a>
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}
