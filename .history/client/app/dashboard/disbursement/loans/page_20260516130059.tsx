"use client";

import { useMemo, useState } from "react";
import { useAllLoans } from "@/hooks/use-loans";
import { DisbursementTable } from "@/components/dashboard/disbursement/disbursement-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { LOAN_STATUS } from "@/lib/constants";

export default function DisbursementLoansPage() {
  const { data, isLoading } = useAllLoans(LOAN_STATUS.SANCTIONED);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredLoans = useMemo(() => {
    const loans = data?.loans ?? [];
    if (!debouncedSearch.trim()) return loans;
    const q = debouncedSearch.toLowerCase();
    return loans.filter(
      (l) =>
        l.borrower.fullName.toLowerCase().includes(q) ||
        l.borrower.email.toLowerCase().includes(q) ||
        l.borrower.userCode.toLowerCase().includes(q) ||
        l.borrower.phoneNumber?.includes(q)
    );
  }, [data, debouncedSearch]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Loans — Pending Disbursal</h1>
        <p className="text-sm text-slate-500 mt-1">Release funds for sanctioned applications.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600 font-medium">
            {data?.loans?.length ?? 0} loan{(data?.loans?.length ?? 0) !== 1 ? "s" : ""} pending disbursal
          </p>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, code..."
          />
        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <DisbursementTable loans={filteredLoans} />
      </div>
    </div>
  );
}