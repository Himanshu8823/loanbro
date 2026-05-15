import { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";
import {
  recordPayment,
  getPaymentsByLoan,
  getPaymentsByBorrower,
} from "../services/payment.service";

// Record a payment against a loan and check if loan is fully repaid
export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const loanId = req.params.id as string;

    const { payment, loanClosed } = await recordPayment(
      loanId,
      req.user!.id,
      req.body
    );

    const message = loanClosed
      ? MESSAGES.LOAN.CLOSED
      : MESSAGES.PAYMENT.RECORDED;

    sendSuccess(res, 201, message, { payment, loanClosed });
  }
);

// Fetch all payments for a specific loan
export const fetchPaymentsByLoan = asyncHandler(
  async (req: Request, res: Response) => {
    const loanId = req.params.id as string;
    const payments = await getPaymentsByLoan(loanId);
    sendSuccess(res, 200, MESSAGES.PAYMENT.FETCH_SUCCESS, { payments });
  }
);

// Fetch all payments made by the authenticated user
export const fetchMyPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const payments = await getPaymentsByBorrower(req.user!.id);
    sendSuccess(res, 200, MESSAGES.PAYMENT.FETCH_SUCCESS, { payments });
  }
);