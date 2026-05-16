"use client";

import { useMemo, useState } from "react";
import { useAllLoans } from "@/hooks/use-loans";
import { SanctionTable } from "@/components/dashboard/sanction/sanction-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { LOAN_STATUS } from "@/lib/constants";

export default function SanctionLoansPage() {
  const { data, isLoading } = useAllLoans();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredLoans = useMemo(() => {
  const loans = (data?.loans ?? []).filter(
    (loan) =>
      loan.status === LOAN_STATUS.APPLIED ||
      loan.status === LOAN_STATUS.SANCTIONED ||
      loan.status === LOAN_STATUS.REJECTED
  );

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
        <h1 className="text-xl font-semibold text-slate-800">Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve or reject loan applications.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600 font-medium">
            {data?.loans?.length ?? 0} application{(data?.loans?.length ?? 0) !== 1 ? "s" : ""} pending
          </p>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, code..."
          />
        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <SanctionTable loans={filteredLoans} />
      </div>
    </div>
  );
}