"use client";

import { useAllLoans } from "@/hooks/use-loans";
import { DisbursementTable } from "@/components/dashboard/disbursement/disbursement-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";

export default function DisbursementPage() {
  const { data, isLoading } = useAllLoans(LOAN_STATUS.SANCTIONED);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Disbursement
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Release funds for sanctioned loan applications.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <DisbursementTable loans={data?.loans ?? []} />
      </div>
    </div>
  );
}