"use client";

import { useAllLoans } from "@/hooks/use-loans";
import { CollectionTable } from "@/components/dashboard/collection/collection-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";

export default function CollectionPage() {
  const { data, isLoading } = useAllLoans(LOAN_STATUS.DISBURSED);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Collection</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record payments for active disbursed loans.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <CollectionTable loans={data?.loans ?? []} />
      </div>
    </div>
  );
}