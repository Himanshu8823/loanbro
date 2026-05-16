"use client";

import Link from "next/link";
import { useMyLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CreditCard,
  User,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LOAN_STATUS } from "@/lib/constants";

export default function BorrowerHomePage() {
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
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500">Manage your loans and applications in one place.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/application">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full">
              <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">New Application</h3>
              <p className="text-xs text-slate-500 mt-1">Start a new loan application</p>
            </div>
          </Link>

          <Link href="/loan">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">My Loans</h3>
              <p className="text-xs text-slate-500 mt-1">Track your applications</p>
            </div>
          </Link>

          <Link href="/profile">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full">
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Profile</h3>
              <p className="text-xs text-slate-500 mt-1">View your information</p>
            </div>
          </Link>
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
              You have an incomplete application
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600">
                  Started on {formatDate(draftLoan.createdAt)}
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/application">Resume Application</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Recent Applications */}
        {allLoans.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>

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

            {allLoans.length > 5 && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/loan">View All Applications</Link>
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {allLoans.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Start your first loan application to get the ball rolling.
            </p>
            <Button asChild className="mt-4">
              <Link href="/application">Start Application</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
