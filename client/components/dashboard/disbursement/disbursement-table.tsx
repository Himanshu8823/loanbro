"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { Loan } from "@/types/loan.types";
import { useDisburseLoan } from "@/hooks/use-loans";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { ConfirmModal } from "@/components/shared/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DisbursementTableProps {
  loans: Loan[];
}

export function DisbursementTable({ loans }: DisbursementTableProps) {
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const { mutate: disburseLoan, isPending } = useDisburseLoan();

  const handleDisburse = () => {
    if (!disbursingId) return;
    disburseLoan(disbursingId, {
      onSuccess: () => setDisbursingId(null),
    });
  };

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No sanctioned loans pending disbursement.
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
              <TableHead>Sanctioned On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
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
                <TableCell className="font-medium text-slate-700">
                  {formatCurrency(loan.totalRepayment)}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {loan.sanctionedAt ? formatDate(loan.sanctionedAt) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={loan.status} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => setDisbursingId(loan._id)}
                    className="gap-1.5"
                  >
                    <Banknote className="h-3.5 w-3.5" />
                    Disburse
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        open={!!disbursingId}
        onClose={() => setDisbursingId(null)}
        onConfirm={handleDisburse}
        title="Disburse Loan"
        description="Confirm that funds have been released to the borrower. This action cannot be undone."
        confirmLabel="Confirm Disbursal"
        isPending={isPending}
      />
    </>
  );
}