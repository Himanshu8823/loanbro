import mongoose from "mongoose";
import Payment, { IPaymentDocument } from "../models/payment.model";
import Loan from "../models/loan.model";
import { AppError } from "../utils/app-error";
import { MESSAGES } from "../constants/messages";
import { LOAN_STATUS } from "../constants/loan-status";
import { roundToTwo } from "../utils/formatters";

/**
 * Records a payment against a disbursed loan.
 * Uses a MongoDB session to atomically update both the payment
 * record and the loan's paidAmount/outstandingAmount in one transaction.
 * Auto-closes the loan when outstanding balance reaches zero.
 */
export const recordPayment = async (
  loanId: string,
  collectedById: string,
  data: {
    utrNumber: string;
    amount: number;
    paymentDate: string;
  }
): Promise<{ payment: IPaymentDocument; loanClosed: boolean }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const loan = await Loan.findById(loanId).session(session);

    if (!loan) {
      throw new AppError(MESSAGES.LOAN.NOT_FOUND, 404);
    }

    if (loan.status !== LOAN_STATUS.DISBURSED) {
      throw new AppError(MESSAGES.PAYMENT.LOAN_NOT_DISBURSED, 400);
    }

    if (data.amount <= 0) {
      throw new AppError(MESSAGES.PAYMENT.ZERO_AMOUNT, 400);
    }

    if (data.amount > loan.outstandingAmount) {
      throw new AppError(MESSAGES.PAYMENT.INVALID_AMOUNT, 400);
    }

    // Check UTR uniqueness before inserting — gives a cleaner error than DB duplicate key
    const existingUTR = await Payment.findOne({
      utrNumber: data.utrNumber.toUpperCase(),
    }).session(session);

    if (existingUTR) {
      throw new AppError(MESSAGES.PAYMENT.UTR_EXISTS, 409);
    }

    const [payment] = await Payment.create(
      [
        {
          loan: loanId,
          borrower: loan.borrower,
          utrNumber: data.utrNumber.toUpperCase(),
          amount: data.amount,
          paymentDate: new Date(data.paymentDate),
          collectedBy: collectedById,
        },
      ],
      { session }
    );

    const updatedPaid = roundToTwo(loan.paidAmount + data.amount);
    const updatedOutstanding = roundToTwo(loan.outstandingAmount - data.amount);

    loan.paidAmount = updatedPaid;
    loan.outstandingAmount = updatedOutstanding;

    // Auto-close when fully repaid
    const loanClosed = updatedOutstanding <= 0;
    if (loanClosed) {
      loan.status = LOAN_STATUS.CLOSED;
      loan.closedAt = new Date();
    }

    await loan.save({ session });
    await session.commitTransaction();

    return { payment, loanClosed };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getPaymentsByLoan = async (
  loanId: string
): Promise<IPaymentDocument[]> => {
  return Payment.find({ loan: loanId })
    .populate("collectedBy", "fullName userCode")
    .sort({ paymentDate: -1 });
};

export const getPaymentsByBorrower = async (
  borrowerId: string
): Promise<IPaymentDocument[]> => {
  return Payment.find({ borrower: borrowerId })
    .populate("loan", "loanAmount totalRepayment status")
    .sort({ paymentDate: -1 });
};