import mongoose, { Schema, Document, Model } from "mongoose";
import { LOAN_STATUS, LoanStatus } from "../constants/loan-status";
import { EMPLOYMENT_TYPES, EmploymentType } from "../constants/employment";

export interface ISalarySlip {
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "jpg" | "jpeg" | "png";
  fileSize: number;
  uploadedAt: Date;
}

export interface ILoanDocument extends Document {
  borrower: mongoose.Types.ObjectId;
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
  sanctionedBy?: mongoose.Types.ObjectId;
  disbursedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
}

const SalarySlipSchema = new Schema<ISalarySlip>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: {
      type: String,
      enum: ["pdf", "jpg", "jpeg", "png"],
      required: true,
    },
    fileSize: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LoanSchema = new Schema<ILoanDocument>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
    },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPES),
      required: true,
    },
    salarySlip: {
      type: SalarySlipSchema,
      default: null,
    },
    loanAmount: {
      type: Number,
      default: 0,
    },
    tenureDays: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      default: 12,
    },
    interestAmount: {
      type: Number,
      default: 0,
    },
    totalRepayment: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(LOAN_STATUS),
      default: LOAN_STATUS.DRAFT,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    sanctionedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

LoanSchema.index({ borrower: 1, status: 1 });
LoanSchema.index({ status: 1 });

const Loan: Model<ILoanDocument> = mongoose.model<ILoanDocument>(
  "Loan",
  LoanSchema
);

export default Loan;