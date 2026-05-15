import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/common.types";
import { Payment, RecordPaymentPayload } from "@/types/payment.types";

// Payment API client: record payments and fetch payment history.
export const paymentService = {
  // Record a payment against a loan; returns whether loan is closed.
  recordPayment: async (
    loanId: string,
    data: RecordPaymentPayload
  ): Promise<ApiResponse<{ payment: Payment; loanClosed: boolean }>> => {
    const res = await axiosInstance.post(`/loans/${loanId}/payments`, data);
    return res.data;
  },

  // Get all payments made for a specific loan.
  getPaymentsByLoan: async (
    loanId: string
  ): Promise<ApiResponse<{ payments: Payment[] }>> => {
    const res = await axiosInstance.get(`/loans/${loanId}/payments`);
    return res.data;
  },

  // Fetch payments associated with the authenticated user.
  getMyPayments: async (): Promise<ApiResponse<{ payments: Payment[] }>> => {
    const res = await axiosInstance.get("/loans/my-payments");
    return res.data;
  },
};