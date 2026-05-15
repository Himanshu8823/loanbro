import { LOAN_STATUS, EMPLOYMENT_TYPES } from "@/lib/constants";

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];
export type EmploymentType =
  (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

export interface SalarySlip {
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "jpg" | "jpeg" | "png";
  fileSize: number;
  uploadedAt: string;
}

export interface Loan {
  _id: string;
  borrower: {
    _id: string;
    fullName: string;
    email: string;
    userCode: string;
    phoneNumber: string;
    panNumber?: string;
    dateOfBirth?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  monthlySalary: number;
  employmentType: EmploymentType;
  salarySlip: SalarySlip | null;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  paidAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedBy?: string;
  disbursedBy?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartLoanPayload {
  panNumber: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentType: EmploymentType;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ApplyLoanPayload {
  loanAmount: number;
  tenureDays: number;
}

export interface SanctionPayload {
  action: "approve" | "reject";
  rejectionReason?: string;
}

export interface SalesLead {
  _id: string;
  fullName: string;
  email: string;
  userCode: string;
  phoneNumber: string;
  createdAt: string;
  hasApplied: boolean;
}