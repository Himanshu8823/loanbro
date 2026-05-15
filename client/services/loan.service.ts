import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/common.types";
import {
  Loan,
  StartLoanPayload,
  ApplyLoanPayload,
  SanctionPayload,
  SalesLead,
} from "@/types/loan.types";

// Loan API client — start applications, upload files, and manage loan lifecycle.
export const loanService = {
  // Create a new draft loan application.
  startApplication: async (
    data: StartLoanPayload
  ): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await axiosInstance.post("/loans/start", data);
    return res.data;
  },

  // Upload a salary slip file for the given loan id.
  uploadSlip: async (
    loanId: string,
    file: File
  ): Promise<ApiResponse<{ loan: Loan }>> => {
    const formData = new FormData();
    formData.append("salarySlip", file);
    const res = await axiosInstance.patch(
      `/loans/${loanId}/upload-slip`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  // Submit an application payload for an existing draft loan.
  applyLoan: async (
    loanId: string,
    data: ApplyLoanPayload
  ): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await axiosInstance.patch(`/loans/${loanId}/apply`, data);
    return res.data;
  },

  // Fetch loans for the authenticated borrower.
  getMyLoans: async (): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const res = await axiosInstance.get("/loans/my-loans");
    return res.data;
  },

  // Admin: list loans with optional status and pagination.
  getAllLoans: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
    const res = await axiosInstance.get("/loans", { params });
    return res.data;
  },

  // Retrieve a single loan by id.
  getLoanById: async (loanId: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await axiosInstance.get(`/loans/${loanId}`);
    return res.data;
  },

  // Approve or reject a loan (admin action).
  sanctionLoan: async (
    loanId: string,
    data: SanctionPayload
  ): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await axiosInstance.patch(`/loans/${loanId}/sanction`, data);
    return res.data;
  },

  // Mark an approved loan as disbursed.
  disburseLoan: async (
    loanId: string
  ): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await axiosInstance.patch(`/loans/${loanId}/disburse`);
    return res.data;
  },

  // Fetch sales leads for reporting.
  getSalesLeads: async (): Promise<ApiResponse<{ leads: SalesLead[] }>> => {
    const res = await axiosInstance.get("/loans/leads");
    return res.data;
  },
};