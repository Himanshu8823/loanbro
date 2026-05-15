import { Types } from "mongoose";
import { LoanStatus } from "../constants/loan-status";
import { EmploymentType } from "../constants/employment";

export interface ISalarySlip {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ILoan {
  _id: Types.ObjectId;
  borrower: Types.ObjectId;
  monthlySalary: number;
  employmentType: EmploymentType;
  salarySlip: ISalarySlip | null;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  paidAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedBy?: Types.ObjectId;
  disbursedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}