"use client";

import { useState } from "react";
import { DashboardNavbar } from "@/components/shared/navbar/dashboard-navbar";
import { DashboardSidebar } from "@/components/shared/sidebar/dashboard-sidebar";
import { useMe } from "@/hooks/use-auth";
import { PageLoader } from "@/components/shared/loaders/page-loader";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading } = useMe();

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}