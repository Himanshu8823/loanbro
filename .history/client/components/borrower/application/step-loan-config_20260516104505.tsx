"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { loanConfigSchema, LoanConfigFormValues } from "@/schemas/loan.schema";
import { useApplyLoan } from "@/hooks/use-loans";
import { calculateSI, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface StepLoanConfigProps {
  loanId: string;
  onSuccess: () => void;
}

export function StepLoanConfig({ loanId, onSuccess }: StepLoanConfigProps) {
  const { mutate: applyLoan, isPending } = useApplyLoan();

  const form = useForm<LoanConfigFormValues>({
    resolver: zodResolver(loanConfigSchema),
    defaultValues: {
      loanAmount: 50000,
      tenureDays: 30,
    },
  });

  const watchedAmount = form.watch("loanAmount");
  const watchedTenure = form.watch("tenureDays");

  // Recalculates only when amount or tenure changes — avoids unnecessary recalculations
  const calculation = useMemo(() => {
    const amount = Number(watchedAmount) || 0;
    const tenure = Number(watchedTenure) || 0;

    if (amount < 50000 || tenure < 30) {
      return null;
    }

    return calculateSI(amount, 12, tenure);
  }, [watchedAmount, watchedTenure]);

  const onSubmit = (data: LoanConfigFormValues) => {
    applyLoan(
      { loanId, data },
      { onSuccess: () => onSuccess() }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={50000}
                    max={500000}
                    step={1000}
                    placeholder="50000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <p className="text-xs text-slate-400">₹50,000 – ₹5,00,000</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="tenureDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenure (Days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={30}
                    max={365}
                    step={1}
                    placeholder="30"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <p className="text-xs text-slate-400">30 – 365 days</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Live calculation panel */}
        {calculation && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Loan Summary
            </p>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Principal Amount</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(Number(watchedAmount))}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Interest Rate</span>
                <span className="font-medium text-slate-800">12% p.a.</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tenure</span>
                <span className="font-medium text-slate-800">
                  {watchedTenure} days
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Interest Amount</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(calculation.interest)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold text-slate-800">
                <span>Total Repayment</span>
                <span className="text-primary">
                  {formatCurrency(calculation.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !calculation}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Submitting application..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}