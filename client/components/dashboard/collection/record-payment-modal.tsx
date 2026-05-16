"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  recordPaymentSchema,
  RecordPaymentFormValues,
} from "@/schemas/payment.schema";
import { useRecordPayment } from "@/hooks/use-payments";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  loanId: string;
  outstandingAmount: number;
  borrowerName: string;
}

export function RecordPaymentModal({
  open,
  onClose,
  loanId,
  outstandingAmount,
  borrowerName,
}: RecordPaymentModalProps) {
  const { mutate: recordPayment, isPending } = useRecordPayment(loanId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      utrNumber: "",
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: RecordPaymentFormValues) => {
    recordPayment(data, {
      onSuccess: () => handleClose(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Record Payment</DialogTitle>
          <DialogDescription className="text-slate-500">
            Recording payment for{" "}
            <span className="font-medium text-slate-700">{borrowerName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
          <span className="text-sm text-slate-600">Outstanding Amount</span>
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(outstandingAmount)}
          </span>
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utrNumber">UTR Number</Label>
            <Input
              id="utrNumber"
              placeholder="UTRNUMBER123"
              className="uppercase"
              {...register("utrNumber")}
              onChange={(e) => {
                const input = e.target;
                input.value = input.value.toUpperCase();
              }}
            />
            {errors.utrNumber && (
              <p className="text-sm text-red-500">{errors.utrNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (₹){" "}
              <span className="text-xs text-slate-400">
                max {formatCurrency(outstandingAmount)}
              </span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0.01}
              max={outstandingAmount}
              placeholder="0.00"
              {...register("amount", {
                setValueAs: (v) => parseFloat(v) || 0,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...register("paymentDate")}
            />
            {errors.paymentDate && (
              <p className="text-sm text-red-500">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}