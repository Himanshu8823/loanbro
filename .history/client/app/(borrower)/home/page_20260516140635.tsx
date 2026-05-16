"use client";

import Link from "next/link";
import { useMyLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LOAN_STATUS } from "@/lib/constants";

export default function BorrowerHomePageDashboard() {
  const { data: loans, isLoading } = useMyLoans();

  if (isLoading) return <PageLoader />;

  const allLoans = loans ?? [];
  const draftLoan = allLoans.find((l) => l.status === LOAN_STATUS.DRAFT);
  const activeLoans = allLoans.filter(
    (l) => [LOAN_STATUS.APPLIED, LOAN_STATUS.SANCTIONED, LOAN_STATUS.DISBURSED].includes(l.status as any)
  );
  const totalDisbursed = allLoans
    .filter((l) => l.status === LOAN_STATUS.DISBURSED)
    .reduce((sum, l) => sum + l.loanAmount, 0);
  const totalOutstanding = allLoans
    .filter((l) => l.status === LOAN_STATUS.DISBURSED)
    .reduce((sum, l) => sum + l.outstandingAmount, 0);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your loans and track applications.</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/application">
              <Plus className="h-5 w-5" />
              Apply for Loan
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Total Applications
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{allLoans.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Active Loans
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{activeLoans.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Total Disbursed
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(totalDisbursed)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Outstanding
            </p>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>

        {/* Draft Loan Alert */}
        {draftLoan && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-medium text-amber-800 mb-3">
              📋 You have an incomplete application
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600">
                  Started on {formatDate(draftLoan.createdAt)} • Resume where you left off
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/application">Resume Application</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Recent Applications */}
        {allLoans.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
              {allLoans.length > 5 && (
                <Link href="/loan" className="text-sm text-primary hover:underline">
                  View All →
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {allLoans.slice(0, 5).map((loan) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatCurrency(loan.loanAmount)}
                        </span>
                        <StatusBadge status={loan.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Applied on {formatDate(loan.createdAt)}
                      </p>
                    </div>
                    <Link href="/loan">
                      <ArrowRight className="h-5 w-5 text-slate-300 hover:text-primary transition-colors" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Start your first loan application to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/application">Apply Now</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
