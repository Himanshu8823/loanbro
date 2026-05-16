"use client";

import { useAllLoans, useSalesLeads } from "@/hooks/use-loans";
import { LeadsTable } from "@/components/dashboard/sales/leads-table";
import { SanctionTable } from "@/components/dashboard/sanction/sanction-table";
import { DisbursementTable } from "@/components/dashboard/disbursement/disbursement-table";
import { CollectionTable } from "@/components/dashboard/collection/collection-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  const { data: applied, isLoading: l1 } = useAllLoans(LOAN_STATUS.APPLIED);
  const { data: sanctioned, isLoading: l2 } = useAllLoans(LOAN_STATUS.SANCTIONED);
  const { data: disbursed, isLoading: l3 } = useAllLoans(LOAN_STATUS.DISBURSED);
  const { data: leads, isLoading: l4 } = useSalesLeads();

  if (l1 || l2 || l3 || l4) return <PageLoader />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Admin — Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Full visibility across all modules.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Sales — Leads</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <LeadsTable leads={leads ?? []} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Sanction — Applications
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <SanctionTable loans={applied?.loans ?? []} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Disbursement — Sanctioned Loans
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <DisbursementTable loans={sanctioned?.loans ?? []} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Collection — Active Loans
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <CollectionTable loans={disbursed?.loans ?? []} />
        </div>
      </section>
    </div>
  );
}