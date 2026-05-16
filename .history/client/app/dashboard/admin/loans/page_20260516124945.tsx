"use client";

import { useMemo, useState } from "react";
import { useAllLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { useDebounce } from "@/hooks/use-debounce";
import { LOAN_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoanStatus } from "@/types/loan.types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Applied", value: LOAN_STATUS.APPLIED },
  { label: "Sanctioned", value: LOAN_STATUS.SANCTIONED },
  { label: "Disbursed", value: LOAN_STATUS.DISBURSED },
  { label: "Closed", value: LOAN_STATUS.CLOSED },
  { label: "Rejected", value: LOAN_STATUS.REJECTED },
];

export default function AdminLoansPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = useAllLoans(statusFilter || undefined);

  const filteredLoans = useMemo(() => {
    const loans = data?.loans ?? [];
    if (!debouncedSearch.trim()) return loans;
    const q = debouncedSearch.toLowerCase();
    return loans.filter(
      (l) =>
        l.borrower.fullName.toLowerCase().includes(q) ||
        l.borrower.email.toLowerCase().includes(q) ||
        l.borrower.userCode.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">All Loans</h1>
        <p className="text-sm text-slate-500 mt-1">Complete loan portfolio across all statuses.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, code..."
          />
        </div>

        {debouncedSearch && (
          <p className="text-xs text-slate-400 mt-3">
            {filteredLoans.length} result{filteredLoans.length !== 1 ? "s" : ""} for &quot;{debouncedSearch}&quot;
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Borrower</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Tenure</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Total Repayment</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Outstanding</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr key={loan._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{loan.borrower.fullName}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{loan.borrower.userCode}</td>
                  <td className="py-3 px-4 text-slate-700">{formatCurrency(loan.loanAmount)}</td>
                  <td className="py-3 px-4 text-slate-600">{loan.tenureDays}d</td>
                  <td className="py-3 px-4 text-slate-700">{formatCurrency(loan.totalRepayment)}</td>
                  <td className="py-3 px-4 font-medium text-primary">{formatCurrency(loan.outstandingAmount)}</td>
                  <td className="py-3 px-4"><StatusBadge status={loan.status as LoanStatus} /></td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(loan.createdAt)}</td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No loans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}