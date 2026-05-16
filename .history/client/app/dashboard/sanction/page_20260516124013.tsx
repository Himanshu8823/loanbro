"use client";

import { useAllLoans } from "@/hooks/use-loans";
import { SanctionTable } from "@/components/dashboard/sanction/sanction-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";

export default function SanctionPage() {
  const { data, isLoading } = useAllLoans(LOAN_STATUS.APPLIED);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Sanction — Review Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve or reject loan applications.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <SanctionTable loans={data?.loans ?? []} />
      </div>
    </div>
  );
}