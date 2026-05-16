"use client";

import { ReactNode } from "react";
import { BorrowerNavbar } from "@/components/borrower/navbar/borrower-navbar";
import { useMe } from "@/hooks/use-auth";
import { PageLoader } from "@/components/shared/loaders/page-loader";

export function BorrowerShell({ children }: { children: ReactNode }) {
  const { isLoading } = useMe();

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <BorrowerNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
