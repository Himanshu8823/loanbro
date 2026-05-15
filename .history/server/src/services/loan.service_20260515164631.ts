import Loan, { ILoanDocument } from "../models/loan.model";
import User from "../models/user.model";
import { assertBREPass } from "./bre.service";
import { calculateLoan } from "./loan-calculation.service";
import { AppError } from "../utils/app-error";
import { MESSAGES } from "../constants/messages";
import { LOAN_STATUS, VALID_TRANSITIONS } from "../constants/loan-status";
import { ROLES } from "../constants/roles";
import { ISalarySlip } from "../models/loan.model";

const FIXED_INTEREST_RATE = 12;

/** Guards against invalid status transitions using the VALID_TRANSITIONS map. */
const assertValidTransition = (
  current: ILoanDocument["status"],
  next: ILoanDocument["status"]
): void => {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new AppError(MESSAGES.LOAN.INVALID_TRANSITION, 400);
  }
};

/**
 * Step 2 of borrower flow.
 * Runs BRE, updates user profile, creates a draft loan.
 * Blocks if borrower already has an active application.
 */
export const startLoanApplication = async (
  borrowerId: string,
  data: {
    panNumber: string;
    dateOfBirth: string;
    monthlySalary: number;
    employmentType: ILoanDocument["employmentType"];
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  }
): Promise<ILoanDocument> => {
  const existingLoan = await Loan.findOne({
    borrower: borrowerId,
    status: {
      $in: [
        LOAN_STATUS.DRAFT,
        LOAN_STATUS.APPLIED,
        LOAN_STATUS.SANCTIONED,
        LOAN_STATUS.DISBURSED,
      ],
    },
  });

  if (existingLoan) {
    throw new AppError(MESSAGES.LOAN.ALREADY_APPLIED, 409);
  }

  assertBREPass({
    dateOfBirth: new Date(data.dateOfBirth),
    monthlySalary: data.monthlySalary,
    panNumber: data.panNumber,
    employmentType: data.employmentType,
  });

  await User.findByIdAndUpdate(borrowerId, {
    panNumber: data.panNumber.toUpperCase(),
    dateOfBirth: new Date(data.dateOfBirth),
    address: data.address,
  });

  const loan = await Loan.create({
    borrower: borrowerId,
    monthlySalary: data.monthlySalary,
    employmentType: data.employmentType,
    status: LOAN_STATUS.DRAFT,
  });

  return loan;
};

/** Step 3 — attaches uploaded salary slip to the draft loan. */
export const attachSalarySlip = async (
  loanId: string,
  borrowerId: string,
  salarySlip: ISalarySlip
): Promise<ILoanDocument> => {
  const loan = await Loan.findOne({ _id: loanId, borrower: borrowerId });

  if (!loan) {
    throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
  }

  if (loan.status !== LOAN_STATUS.DRAFT) {
    throw new AppError("Salary slip can only be uploaded for draft applications", 400);
  }

  loan.salarySlip = salarySlip;
  await loan.save();

  return loan;
};

/**
 * Step 4 — calculates interest, sets repayment amounts,
 * transitions loan from draft → applied.
 * Blocks if salary slip has not been uploaded yet.
 */
export const applyLoan = async (
  loanId: string,
  borrowerId: string,
  data: { loanAmount: number; tenureDays: number }
): Promise<ILoanDocument> => {
  const loan = await Loan.findOne({ _id: loanId, borrower: borrowerId });

  if (!loan) {
    throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
  }

  if (loan.status !== LOAN_STATUS.DRAFT) {
    throw new AppError(MESSAGES.LOAN.INVALID_TRANSITION, 400);
  }

  if (!loan.salarySlip) {
    throw new AppError(MESSAGES.UPLOAD.REQUIRED, 400);
  }

  const { interestRate, interestAmount, totalRepayment } = calculateLoan({
    principal: data.loanAmount,
    tenureDays: data.tenureDays,
    annualRate: FIXED_INTEREST_RATE,
  });

  loan.loanAmount = data.loanAmount;
  loan.tenureDays = data.tenureDays;
  loan.interestRate = interestRate;
  loan.interestAmount = interestAmount;
  loan.totalRepayment = totalRepayment;
  loan.outstandingAmount = totalRepayment;
  loan.paidAmount = 0;
  loan.status = LOAN_STATUS.APPLIED;

  await loan.save();

  return loan;
};

export const sanctionLoan = async (
  loanId: string,
  executiveId: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<ILoanDocument> => {
  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
  }

  if (action === "reject") {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new AppError(MESSAGES.LOAN.REJECTION_REASON_REQUIRED, 400);
    }
    assertValidTransition(loan.status, LOAN_STATUS.REJECTED);
    loan.status = LOAN_STATUS.REJECTED;
    loan.rejectionReason = rejectionReason.trim();
  } else {
    assertValidTransition(loan.status, LOAN_STATUS.SANCTIONED);
    loan.status = LOAN_STATUS.SANCTIONED;
    loan.sanctionedBy = executiveId as any;
    loan.sanctionedAt = new Date();
  }

  await loan.save();
  return loan;
};

export const disburseLoan = async (
  loanId: string,
  executiveId: string
): Promise<ILoanDocument> => {
  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
  }

  assertValidTransition(loan.status, LOAN_STATUS.DISBURSED);

  loan.status = LOAN_STATUS.DISBURSED;
  loan.disbursedBy = executiveId as any;
  loan.disbursedAt = new Date();

  await loan.save();
  return loan;
};

export const getBorrowerLoans = async (
  borrowerId: string
): Promise<ILoanDocument[]> => {
  return Loan.find({ borrower: borrowerId }).sort({ createdAt: -1 });
};

export const getAllLoans = async (filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ loans: ILoanDocument[]; total: number }> => {
  const { status, page = 1, limit = 10 } = filters;
  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [loans, total] = await Promise.all([
    Loan.find(query)
      .populate("borrower", "fullName email userCode phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Loan.countDocuments(query),
  ]);

  return { loans, total };
};

export const getLoanById = async (loanId: string): Promise<ILoanDocument> => {
  const loan = await Loan.findById(loanId).populate(
    "borrower",
    "fullName email userCode phoneNumber panNumber dateOfBirth address"
  );

  if (!loan) {
    throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
  }

  return loan;
};

/**
 * Returns all borrowers with a flag indicating whether they have
 * submitted a loan application — used by the Sales dashboard.
 */
export const getSalesLeads = async (): Promise<unknown[]> => {
  return User.find({ role: ROLES.BORROWER, isActive: true })
    .select("fullName email userCode phoneNumber createdAt")
    .sort({ createdAt: -1 })
    .lean()
    .then(async (users) => {
      const userIds = users.map((u) => u._id);

      const loansExist = await Loan.find({
        borrower: { $in: userIds },
      }).distinct("borrower");

      const loanBorrowerSet = new Set(loansExist.map(String));

      return users.map((u) => ({
        ...u,
        hasApplied: loanBorrowerSet.has(String(u._id)),
      }));
    });
};