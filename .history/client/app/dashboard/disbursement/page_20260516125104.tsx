"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAllLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { LOAN_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Banknote, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function DisbursementPage() {
  const { data: sanctioned, isLoading: l1 } = useAllLoans(LOAN_STATUS.SANCTIONED);
  const { data: disbursed, isLoading: l2 } = useAllLoans(LOAN_STATUS.DISBURSED);

  const stats = useMemo(() => ({
    pendingCount: sanctioned?.loans?.length ?? 0,
    disbursedCount: disbursed?.loans?.length ?? 0,
    pendingAmount: sanctioned?.loans?.reduce((s, l) => s + l.loanAmount, 0) ?? 0,
    totalDisbursed: disbursed?.loans?.reduce((s, l) => s + l.loanAmount, 0) ?? 0,
  }), [sanctioned, disbursed]);

  if (l1 || l2) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Disbursement Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Fund release summary.</p>
        </div>
        <Link href="/dashboard/disbursement/loans" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          View pending loans <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50"><Clock className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-sm text-slate-500">Pending Disbursal</p><p className="text-2xl font-bold text-slate-800">{stats.pendingCount}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-50"><CheckCircle className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-sm text-slate-500">Disbursed</p><p className="text-2xl font-bold text-slate-800">{stats.disbursedCount}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50"><Banknote className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Pending Amount</p><p className="text-lg font-bold text-slate-800">{formatCurrency(stats.pendingAmount)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50"><Banknote className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Total Disbursed</p><p className="text-lg font-bold text-slate-800">{formatCurrency(stats.totalDisbursed)}</p></div>
        </div>
      </div>

      <Link href="/dashboard/disbursement/loans" className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all">
        <div>
          <p className="text-sm font-semibold text-slate-800">Release Pending Funds</p>
          <p className="text-xs text-slate-400 mt-0.5">{stats.pendingCount} loan{stats.pendingCount !== 1 ? "s" : ""} waiting for disbursal</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </Link>
    </div>
  );
}