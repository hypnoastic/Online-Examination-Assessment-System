import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata = {
  title: "Online Examination Assessment System",
  description: "Role-aware dashboard shell and student runtime entry structure.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#eaf0f7",
          color: "#102033",
          fontFamily:
            '"Segoe UI", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
