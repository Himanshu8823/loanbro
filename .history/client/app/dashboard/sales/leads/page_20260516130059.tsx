"use client";

import { useMemo, useState } from "react";
import { useSalesLeads } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { SearchInput } from "@/components/shared/tables/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Not Applied", value: "not-applied" },
];

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useSalesLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredLeads = useMemo(() => {
    let result = leads;

    if (filter === "applied") result = result.filter((l) => l.hasApplied);
    if (filter === "not-applied") result = result.filter((l) => !l.hasApplied);

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phoneNumber.includes(q) ||
          l.userCode.toLowerCase().includes(q)
      );
    }

    return result;
  }, [leads, filter, debouncedSearch]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Leads</h1>
        <p className="text-sm text-slate-500 mt-1">All registered borrowers on the platform.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-slate-800 text-white"
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
            placeholder="Search by name, email, phone..."
          />
        </div>


      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Registered</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{lead.fullName}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{lead.userCode}</td>
                  <td className="py-3 px-4 text-slate-600">{lead.email}</td>
                  <td className="py-3 px-4 text-slate-600">{lead.phoneNumber}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="py-3 px-4">
                    <Badge className={lead.hasApplied ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                      {lead.hasApplied ? "Applied" : "Not Applied"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}