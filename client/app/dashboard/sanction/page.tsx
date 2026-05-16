"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAllLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function SanctionPage() {
  const { data: applied, isLoading: l1 } = useAllLoans(LOAN_STATUS.APPLIED);
  const { data: sanctioned, isLoading: l2 } = useAllLoans(LOAN_STATUS.SANCTIONED);
  const { data: rejected, isLoading: l3 } = useAllLoans(LOAN_STATUS.REJECTED);

  const stats = useMemo(() => ({
    pending: applied?.loans?.length ?? 0,
    sanctioned: sanctioned?.loans?.length ?? 0,
    rejected: rejected?.loans?.length ?? 0,
    pendingAmount: applied?.loans?.reduce((s, l) => s + l.loanAmount, 0) ?? 0,
  }), [applied, sanctioned, rejected]);

  const chartData = [
    { name: "Pending", count: stats.pending, fill: "#3b82f6" },
    { name: "Sanctioned", count: stats.sanctioned, fill: "#22c55e" },
    { name: "Rejected", count: stats.rejected, fill: "#ef4444" },
  ];

  if (l1 || l2 || l3) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sanction Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Application review summary.</p>
        </div>
        <Link href="/dashboard/sanction/loans" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          Review applications <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50"><Clock className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Pending Review</p><p className="text-2xl font-bold text-slate-800">{stats.pending}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Sanctioned</p><p className="text-2xl font-bold text-slate-800">{stats.sanctioned}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50"><XCircle className="h-5 w-5 text-red-500" /></div>
          <div><p className="text-sm text-slate-500">Rejected</p><p className="text-2xl font-bold text-slate-800">{stats.rejected}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50"><Clock className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-sm text-slate-500">Pending Amount</p><p className="text-lg font-bold text-slate-800">{formatCurrency(stats.pendingAmount)}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-6">Application Overview</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Link href="/dashboard/sanction/loans" className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all">
        <div>
          <p className="text-sm font-semibold text-slate-800">Review Pending Applications</p>
          <p className="text-xs text-slate-400 mt-0.5">{stats.pending} application{stats.pending !== 1 ? "s" : ""} waiting for review</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </Link>
    </div>
  );
}