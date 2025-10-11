export const metadata = {
  title: "3I/Atlas",
  description: "Live drops from four Printify outposts",
};

import ErrorBoundary from "@/components/ErrorBoundary";
import { initializeErrorHandling } from "@/lib/runtime-error-handler";
import "./globals.css";

// Initialize global error handling for browser extension conflicts
if (typeof window !== "undefined") {
  initializeErrorHandling();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
