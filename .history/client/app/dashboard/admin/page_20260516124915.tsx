"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAllLoans, useSalesLeads } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Users, Clock, Banknote, CreditCard,
  CheckCircle, XCircle, ArrowRight,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Applied: "#3b82f6",
  Sanctioned: "#f59e0b",
  Disbursed: "#8b5cf6",
  Closed: "#22c55e",
  Rejected: "#ef4444",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}

function StatCard({ label, value, icon, color, href }: StatCardProps) {
  const content = (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 ${href ? "hover:border-primary/40 hover:shadow-sm transition-all" : ""}`}>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      {href && <ArrowRight className="h-4 w-4 text-slate-300" />}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminPage() {
  const { data: allLoans, isLoading: l1 } = useAllLoans();
  const { data: leads, isLoading: l2 } = useSalesLeads();

  const loans = allLoans?.loans ?? [];

  const stats = useMemo(() => ({
    leads: leads?.length ?? 0,
    applied: loans.filter((l) => l.status === LOAN_STATUS.APPLIED).length,
    sanctioned: loans.filter((l) => l.status === LOAN_STATUS.SANCTIONED).length,
    disbursed: loans.filter((l) => l.status === LOAN_STATUS.DISBURSED).length,
    closed: loans.filter((l) => l.status === LOAN_STATUS.CLOSED).length,
    rejected: loans.filter((l) => l.status === LOAN_STATUS.REJECTED).length,
    totalDisbursed: loans
      .filter((l) => [LOAN_STATUS.DISBURSED, LOAN_STATUS.CLOSED].includes(l.status as any))
      .reduce((s, l) => s + l.loanAmount, 0),
    totalCollected: loans.reduce((s, l) => s + l.paidAmount, 0),
    totalOutstanding: loans.reduce((s, l) => s + l.outstandingAmount, 0),
  }), [loans, leads]);

  const chartData = [
    { name: "Applied", count: stats.applied },
    { name: "Sanctioned", count: stats.sanctioned },
    { name: "Disbursed", count: stats.disbursed },
    { name: "Closed", count: stats.closed },
    { name: "Rejected", count: stats.rejected },
  ];

  if (l1 || l2) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Admin Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Full portfolio visibility across all modules.</p>
        </div>
        <Link
          href="/dashboard/admin/loans"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all loans <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.leads} icon={<Users className="h-5 w-5 text-blue-600" />} color="bg-blue-50" href="/dashboard/sales/leads" />
        <StatCard label="Pending Sanction" value={stats.applied} icon={<Clock className="h-5 w-5 text-amber-600" />} color="bg-amber-50" href="/dashboard/sanction/loans" />
        <StatCard label="Sanctioned" value={stats.sanctioned} icon={<CheckCircle className="h-5 w-5 text-yellow-600" />} color="bg-yellow-50" href="/dashboard/disbursement/loans" />
        <StatCard label="Active Loans" value={stats.disbursed} icon={<Banknote className="h-5 w-5 text-purple-600" />} color="bg-purple-50" href="/dashboard/collection/loans" />
        <StatCard label="Closed" value={stats.closed} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="bg-green-50" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle className="h-5 w-5 text-red-500" />} color="bg-red-50" />
        <StatCard label="Total Disbursed" value={formatCurrency(stats.totalDisbursed)} icon={<Banknote className="h-5 w-5 text-violet-600" />} color="bg-violet-50" />
        <StatCard label="Total Collected" value={formatCurrency(stats.totalCollected)} icon={<CreditCard className="h-5 w-5 text-emerald-600" />} color="bg-emerald-50" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-6">Loan Portfolio — Status Breakdown</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick links to all modules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sales Leads", href: "/dashboard/sales/leads", color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Applications", href: "/dashboard/sanction/loans", color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Disbursement", href: "/dashboard/disbursement/loans", color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Collection", href: "/dashboard/collection/loans", color: "text-green-600 bg-green-50 border-green-100" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between p-4 rounded-xl border font-medium text-sm ${item.color} hover:shadow-sm transition-all`}
          >
            {item.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}