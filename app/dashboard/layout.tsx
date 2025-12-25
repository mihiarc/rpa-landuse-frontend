"use client";

import { Navigation } from "@/components/shared/navigation";

/**
 * Dashboard layout with navigation sidebar.
 * Used for authenticated users in the main application.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
