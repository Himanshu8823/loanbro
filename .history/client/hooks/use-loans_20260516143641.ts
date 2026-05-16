"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loanService } from "@/services/loan.service";
import { StartLoanPayload, ApplyLoanPayload, SanctionPayload } from "@/types/loan.types";

export const LOAN_QUERY_KEYS = {
  myLoans: ["loans", "my-loans"],
  allLoans: (status?: string) => ["loans", "all", status],
  loan: (id: string) => ["loans", id],
  leads: ["loans", "leads"],
};

/** Fetches borrower's own loans — used for resume logic in ApplicationWizard. */
export const useMyLoans = () => {
  return useQuery({
    queryKey: LOAN_QUERY_KEYS.myLoans,
    queryFn: async () => {
      const res = await loanService.getMyLoans();
      return res.data?.loans ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useAllLoans = (status?: string) => {
  return useQuery({
    queryKey: LOAN_QUERY_KEYS.allLoans(status),
    queryFn: async () => {
      const res = await loanService.getAllLoans({ status });
      return res.data ?? { loans: [], total: 0 };
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useLoanById = (loanId: string) => {
  return useQuery({
    queryKey: LOAN_QUERY_KEYS.loan(loanId),
    queryFn: async () => {
      const res = await loanService.getLoanById(loanId);
      return res.data?.loan ?? null;
    },
    enabled: !!loanId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useStartApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartLoanPayload) => loanService.startApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.myLoans });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to start application");
    },
  });
};

export const useUploadSlip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, file }: { loanId: string; file: File }) =>
      loanService.uploadSlip(loanId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.myLoans });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to upload salary slip");
    },
  });
};

export const useApplyLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: ApplyLoanPayload }) =>
      loanService.applyLoan(loanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.myLoans });
      toast.success("Loan application submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to submit application");
    },
  });
};

export const useSanctionLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: SanctionPayload }) =>
      loanService.sanctionLoan(loanId, data),
 onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ["loans", "all"],
  });

  toast.success("Loan status updated successfully");
},
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Action failed");
    },
  });
};

export const useDisburseLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => loanService.disburseLoan(loanId),
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.allLoans() });
  toast.success("Loan disbursed successfully");
},
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Disburse failed");
    },
  });
};

export const useSalesLeads = () => {
  return useQuery({
    queryKey: LOAN_QUERY_KEYS.leads,
    queryFn: async () => {
      const res = await loanService.getSalesLeads();
      return res.data?.leads ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
};