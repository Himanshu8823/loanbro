"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Loan } from "@/types/loan.types";
import { useSanctionLoan } from "@/hooks/use-loans";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LOAN_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { ConfirmModal } from "@/components/shared/modals/confirm-modal";
import { RejectModal } from "./reject-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SanctionTableProps {
  loans: Loan[];
}

export function SanctionTable({ loans }: SanctionTableProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { mutate: sanctionLoan, isPending } = useSanctionLoan();

  const handleApprove = () => {
    if (!approvingId) return;
    sanctionLoan(
      { loanId: approvingId, data: { action: "approve" } },
      { onSuccess: () => setApprovingId(null) }
    );
  };

  const handleReject = (reason: string) => {
    if (!rejectingId) return;
    sanctionLoan(
      {
        loanId: rejectingId,
        data: { action: "reject", rejectionReason: reason },
      },
      { onSuccess: () => setRejectingId(null) }
    );
  };

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No applications to review.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Borrower</TableHead>
              <TableHead>User Code</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Total Repayment</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan._id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-800">
                  {loan.borrower.fullName}
                </TableCell>
                <TableCell className="text-slate-500 text-xs">
                  {loan.borrower.userCode}
                </TableCell>
                <TableCell className="text-slate-700">
                  {formatCurrency(loan.loanAmount)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {loan.tenureDays} days
                </TableCell>
                <TableCell className="text-slate-700 font-medium">
                  {formatCurrency(loan.totalRepayment)}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {formatDate(loan.createdAt)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={loan.status} />
                </TableCell>
               <TableCell>
  {loan.status === LOAN_STATUS.APPLIED ? (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        onClick={() => setApprovingId(loan._id)}
      >
        <CheckCircle className="h-3.5 w-3.5 mr-1" />
        Approve
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => setRejectingId(loan._id)}
      >
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Reject
      </Button>
    </div>
  ) : (
    <span className="text-xs text-slate-400 font-medium">
      Action Completed
    </span>
  )}
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        open={!!approvingId}
        onClose={() => setApprovingId(null)}
        onConfirm={handleApprove}
        title="Approve Loan"
        description="Are you sure you want to approve this loan application? This action cannot be undone."
        confirmLabel="Approve"
        isPending={isPending}
      />

      <RejectModal
        open={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleReject}
        isPending={isPending}
      />
    </>
  );
}