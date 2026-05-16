"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Loan } from "@/types/loan.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/badges/status-badge";
import { RecordPaymentModal } from "./record-payment-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CollectionTableProps {
  loans: Loan[];
}

export function CollectionTable({ loans }: CollectionTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No active loans for collection.
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
              <TableHead>Total Repayment</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Disbursed On</TableHead>
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
                <TableCell className="text-slate-700">
                  {formatCurrency(loan.totalRepayment)}
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  {formatCurrency(loan.paidAmount)}
                </TableCell>
                <TableCell className="text-primary font-semibold">
                  {formatCurrency(loan.outstandingAmount)}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {loan.disbursedAt ? formatDate(loan.disbursedAt) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={loan.status} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLoan(loan)}
                    className="gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Payment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLoan && (
        <RecordPaymentModal
          open={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
          loanId={selectedLoan._id}
          outstandingAmount={selectedLoan.outstandingAmount}
          borrowerName={selectedLoan.borrower.fullName}
        />
      )}
    </>
  );
}