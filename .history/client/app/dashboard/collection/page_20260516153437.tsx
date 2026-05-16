"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useAllLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function CollectionPage() {
  const { data: disbursed, isLoading: l1 } = useAllLoans(LOAN_STATUS.DISBURSED);
  const { data: closed, isLoading: l2 } = useAllLoans(LOAN_STATUS.CLOSED);

  const stats = useMemo(() => {
    const activeLoans = disbursed?.loans ?? [];
    const closedLoans = closed?.loans ?? [];
    return {
      activeCount: activeLoans.length,
      closedCount: closedLoans.length,
      totalOutstanding: activeLoans.reduce((s, l) => s + l.outstandingAmount, 0),
      totalCollected: [...activeLoans, ...closedLoans].reduce((s, l) => s + l.paidAmount, 0),
    };
  }, [disbursed, closed]);

  const chartData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    (closed?.loans ?? []).forEach((loan) => {
      if (loan.closedAt) {
        const month = new Date(loan.closedAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthMap[month] = (monthMap[month] ?? 0) + loan.paidAmount;
      }
    });
    return Object.entries(monthMap).map(([month, amount]) => ({ month, amount })).slice(-6);
  }, [closed]);

  if (l1 || l2) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Collection Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Outstanding balance and collection summary.</p>
        </div>
        <Link href="/dashboard/collection/loans" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          Record payments <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-50"><AlertCircle className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-sm text-slate-500">Active Loans</p><p className="text-2xl font-bold text-slate-800">{stats.activeCount}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50"><CreditCard className="h-5 w-5 text-red-500" /></div>
          <div><p className="text-sm text-slate-500">Total Outstanding</p><p className="text-lg font-bold text-slate-800">{formatCurrency(stats.totalOutstanding)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50"><TrendingUp className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Total Collected</p><p className="text-lg font-bold text-slate-800">{formatCurrency(stats.totalCollected)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-sm text-slate-500">Closed Loans</p><p className="text-2xl font-bold text-slate-800">{stats.closedCount}</p></div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-6">Collections — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }} formatter={(value: any) => [formatCurrency(value as number), "Amount"]} />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: "#8b5cf6" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <Link href="/dashboard/collection/loans" className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all">
        <div>
          <p className="text-sm font-semibold text-slate-800">Record Payments</p>
          <p className="text-xs text-slate-400 mt-0.5">{stats.activeCount} active loan{stats.activeCount !== 1 ? "s" : ""} with outstanding balance</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </Link>
    </div>
  );
}