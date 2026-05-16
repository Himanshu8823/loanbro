"use client";

import { useSalesLeads } from "@/hooks/use-loans";
import { LeadsTable } from "@/components/dashboard/sales/leads-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";

export default function SalesPage() {
  const { data: leads = [], isLoading } = useSalesLeads();

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Sales — Leads</h1>
        <p className="text-sm text-slate-500 mt-1">
          Borrowers who have registered on the platform.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}