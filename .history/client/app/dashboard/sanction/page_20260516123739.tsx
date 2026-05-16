"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAllLoans } from "@/hooks/use-loans";
import { SanctionTable } from "@/components/dashboard/sanction/sanction-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { LOAN_STATUS } from "@/lib/constants";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SanctionPage() {
  const { data: appliedData, isLoading: l1 } = useAllLoans(LOAN_STATUS.APPLIED);
  const { data: sanctionedData, isLoading: l2 } = useAllLoans(LOAN_STATUS.SANCTIONED);
  const { data: rejectedData, isLoading: l3 } = useAllLoans(LOAN_STATUS.REJECTED);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const stats = useMemo(() => {
    const pending = appliedData?.loans?.length ?? 0;
    const sanctioned = sanctionedData?.loans?.length ?? 0;
    const rejected = rejectedData?.loans?.length ?? 0;
    const totalPendingAmount = appliedData?.loans?.reduce(
      (sum, l) => sum + l.loanAmount, 0
    ) ?? 0;
    return { pending, sanctioned, rejected, totalPendingAmount };
  }, [appliedData, sanctionedData, rejectedData]);

  const filteredLoans = useMemo(() => {
    const loans = appliedData?.loans ?? [];
    if (!debouncedSearch.trim()) return loans;
    const q = debouncedSearch.toLowerCase();
    return loans.filter(
      (l) =>
        l.borrower.fullName.toLowerCase().includes(q) ||
        l.borrower.email.toLowerCase().includes(q) ||
        l.borrower.userCode.toLowerCase().includes(q) ||
        l.borrower.phoneNumber?.includes(q)
    );
  }, [appliedData, debouncedSearch]);

  const chartData = [
    { name: "Pending", count: stats.pending, fill: "#3b82f6" },
    { name: "Sanctioned", count: stats.sanctioned, fill: "#22c55e" },
    { name: "Rejected", count: stats.rejected, fill: "#ef4444" },
  ];

  if (l1 || l2 || l3) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Sanction — Review</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve or reject loan applications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pending Review</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sanctioned</p>
            <p className="text-2xl font-bold text-slate-800">{stats.sanctioned}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="text-2xl font-bold text-slate-800">{stats.rejected}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pending Amount</p>
            <p className="text-lg font-bold text-slate-800">
              {formatCurrency(stats.totalPendingAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-6">
            Application Overview
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Pending Applications
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, code..."
            />
          </div>
          {debouncedSearch && (
            <p className="text-xs text-slate-400 mb-3">
              {filteredLoans.length} result{filteredLoans.length !== 1 ? "s" : ""} for &quot;{debouncedSearch}&quot;
            </p>
          )}
          <SanctionTable loans={filteredLoans} />
        </div>
      </div>
    </div>
  );
}