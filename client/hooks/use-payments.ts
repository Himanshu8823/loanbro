"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { RecordPaymentPayload } from "@/types/payment.types";
import { LOAN_QUERY_KEYS } from "./use-loans";

export const PAYMENT_QUERY_KEYS = {
  byLoan: (loanId: string) => ["payments", "loan", loanId],
  myPayments: ["payments", "my"],
};

export const usePaymentsByLoan = (loanId: string) => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.byLoan(loanId),
    queryFn: async () => {
      const res = await paymentService.getPaymentsByLoan(loanId);
      return res.data?.payments ?? [];
    },
    enabled: !!loanId,
    staleTime: 1000 * 60,
  });
};

export const useMyPayments = () => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.myPayments,
    queryFn: async () => {
      const res = await paymentService.getMyPayments();
      return res.data?.payments ?? [];
    },
    staleTime: 1000 * 60,
  });
};

export const useRecordPayment = (loanId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentPayload) =>
      paymentService.recordPayment(loanId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.byLoan(loanId),
      });
      queryClient.invalidateQueries({
        queryKey: LOAN_QUERY_KEYS.loan(loanId),
      });
      queryClient.invalidateQueries({
        queryKey: LOAN_QUERY_KEYS.allLoans(),
      });

      const message = res.data?.loanClosed
        ? "Payment recorded — loan is now closed"
        : "Payment recorded successfully";

      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to record payment");
    },
  });
};