"use client";

import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useMyLoans } from "@/hooks/use-loans";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoanStatus } from "@/types/loan.types";

export default function BorrowerLoansPage() {
  const { data: loans, isLoading } = useMyLoans();

  if (isLoading) return <PageLoader />;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Loans</h1>
            <p className="text-slate-500 mt-1">Track all your loan applications and their status.</p>
          </div>
          <Button asChild>
            <Link href="/application" className="gap-2">
              New Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Loans List */}
        {!loans || loans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No loans found</p>
            <p className="text-sm text-slate-400 mt-1">Start your first application to see it here.</p>
            <Button asChild className="mt-4">
              <Link href="/application">Start New Application</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan._id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Loan Code & Status */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Loan Code</p>
                    <p className="text-lg font-semibold text-slate-800 mt-1">{loan.borrower.userCode}</p>
                  </div>
                  <div className="flex items-end justify-between sm:justify-end gap-2">
                    <StatusBadge status={loan.status as LoanStatus} />
                  </div>
                </div>

                {/* Loan Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Loan Amount</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {formatCurrency(loan.loanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tenure</p>
                    <p className="font-semibold text-slate-800 mt-1">{loan.tenureDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Interest (12% p.a.)</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {formatCurrency(loan.totalRepayment - loan.loanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Repayment</p>
                    <p className="font-semibold text-primary mt-1">
                      {formatCurrency(loan.totalRepayment)}
                    </p>
                  </div>
                </div>

                {/* Payment Status (if disbursed) */}
                {loan.status === "disbursed" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-semibold text-green-600 mt-1">
                        {formatCurrency(loan.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Outstanding</p>
                      <p className="font-semibold text-primary mt-1">
                        {formatCurrency(loan.outstandingAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Progress</p>
                      <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(loan.paidAmount / loan.totalRepayment) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                  {loan.createdAt && (
                    <div>
                      <p className="text-slate-500">Created</p>
                      <p className="text-slate-700 font-medium mt-1">{formatDate(loan.createdAt)}</p>
                    </div>
                  )}
                  {loan.sanctionedAt && (
                    <div>
                      <p className="text-slate-500">Sanctioned</p>
                      <p className="text-slate-700 font-medium mt-1">{formatDate(loan.sanctionedAt)}</p>
                    </div>
                  )}
                  {loan.disbursedAt && (
                    <div>
                      <p className="text-slate-500">Disbursed</p>
                      <p className="text-slate-700 font-medium mt-1">{formatDate(loan.disbursedAt)}</p>
                    </div>
                  )}
                  {loan.closedAt && (
                    <div>
                      <p className="text-slate-500">Closed</p>
                      <p className="text-slate-700 font-medium mt-1">{formatDate(loan.closedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
