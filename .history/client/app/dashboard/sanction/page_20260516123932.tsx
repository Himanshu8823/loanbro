"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSalesLeads } from "@/hooks/use-loans";
import { LeadsTable } from "@/components/dashboard/sales/leads-table";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { Users, UserCheck, UserX } from "lucide-react";

export default function SalesPage() {
  const { data: leads = [], isLoading } = useSalesLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const stats = useMemo(() => {
    const applied = leads.filter((l) => l.hasApplied).length;
    return { total: leads.length, applied, notApplied: leads.length - applied };
  }, [leads]);

  // Filter runs on debounced value — input itself is never blocked
  const filteredLeads = useMemo(() => {
    if (!debouncedSearch.trim()) return leads;
    const q = debouncedSearch.toLowerCase();
    return leads.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phoneNumber.includes(q) ||
        l.userCode.toLowerCase().includes(q)
    );
  }, [leads, debouncedSearch]);

  const pieData = [
    { name: "Applied", value: stats.applied },
    { name: "Not Applied", value: stats.notApplied },
  ];

  const PIE_COLORS = ["#22c55e", "#f59e0b"];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Sales — Leads</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track registered borrowers and their application status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Leads</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Applied</p>
            <p className="text-2xl font-bold text-slate-800">{stats.applied}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50">
            <UserX className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Not Applied</p>
            <p className="text-2xl font-bold text-slate-800">{stats.notApplied}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Application Conversion
          </h2>
          {stats.total === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-sm font-semibold text-slate-700">All Leads</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, phone..."
            />
          </div>
          {debouncedSearch && (
            <p className="text-xs text-slate-400 mb-3">
              {filteredLeads.length} result{filteredLeads.length !== 1 ? "s" : ""} for &quot;{debouncedSearch}&quot;
            </p>
          )}
          <LeadsTable leads={filteredLeads} />
        </div>
      </div>
    </div>
  );
}