"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useSalesLeads } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { Users, UserCheck, UserX, ArrowRight } from "lucide-react";

export default function SalesPage() {
  const { data: leads = [], isLoading } = useSalesLeads();

  const stats = useMemo(() => ({
    total: leads.length,
    applied: leads.filter((l) => l.hasApplied).length,
    notApplied: leads.filter((l) => !l.hasApplied).length,
  }), [leads]);

  const pieData = [
    { name: "Applied", value: stats.applied },
    { name: "Not Applied", value: stats.notApplied },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sales Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Lead tracking and conversion summary.</p>
        </div>
        <Link
          href="/dashboard/sales/leads"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all leads <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50"><Users className="h-5 w-5 text-blue-600" /></div>
          <div>
            <p className="text-sm text-slate-500">Total Leads</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50"><UserCheck className="h-5 w-5 text-green-600" /></div>
          <div>
            <p className="text-sm text-slate-500">Applied</p>
            <p className="text-2xl font-bold text-slate-800">{stats.applied}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50"><UserX className="h-5 w-5 text-amber-600" /></div>
          <div>
            <p className="text-sm text-slate-500">Not Applied</p>
            <p className="text-2xl font-bold text-slate-800">{stats.notApplied}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Application Conversion</h2>
        {stats.total === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No leads yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/sales/leads"
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all"
      >
        <div>
          <p className="text-sm font-semibold text-slate-800">View Full Leads List</p>
          <p className="text-xs text-slate-400 mt-0.5">Search, filter and track all registered borrowers</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </Link>
    </div>
  );
}