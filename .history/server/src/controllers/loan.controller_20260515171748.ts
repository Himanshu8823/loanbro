import { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";
import { uploadSalarySlip } from "../services/upload.service";
import { env } from "../config/env";
import {
  startLoanApplication,
  attachSalarySlip,
  applyLoan,
  sanctionLoan,
  disburseLoan,
  getBorrowerLoans,
  getAllLoans,
  getLoanById,
  getSalesLeads,
} from "../services/loan.service";

/**
 * Create a new loan application draft for the authenticated borrower.
 * Expects application data in `req.body`; returns the created draft.
 */
export const startApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const loan = await startLoanApplication(req.user!.id, req.body);
    sendSuccess(res, 201, MESSAGES.LOAN.DRAFT_CREATED, { loan });
  }
);

/**
 * Upload and attach a salary slip file to a loan application.
 * Expects a multipart file in `req.file` and a loan id in the route params.
 */
export const uploadSlip = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      sendError(res, 400, MESSAGES.UPLOAD.REQUIRED);
      return;
    }

    const loanId = req.params.id as string;

    const salarySlip = await uploadSalarySlip(req.file, env.cloudinary.folder);
    const loan = await attachSalarySlip(loanId, req.user!.id, salarySlip);

    sendSuccess(res, 200, MESSAGES.UPLOAD.SUCCESS, { loan });
  }
);

/**
 * Submit a draft loan application for review.
 * Route expects loan id in params and application payload in `req.body`.
 */
export const submitApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const loanId = req.params.id as string;
    const loan = await applyLoan(loanId, req.user!.id, req.body);
    sendSuccess(res, 200, MESSAGES.LOAN.APPLIED, { loan });
  }
);

/**
 * Approve or reject a loan application (admin action).
 * Body must include `action` set to "approve" or "reject" and optional rejection reason.
 */
export const sanctionApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const loanId = req.params.id as string;
    const { action, rejectionReason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      sendError(res, 400, "Action must be approve or reject");
      return;
    }

    const loan = await sanctionLoan(loanId, req.user!.id, action, rejectionReason);
    const message = action === "approve" ? MESSAGES.LOAN.SANCTIONED : MESSAGES.LOAN.REJECTED;

    sendSuccess(res, 200, message, { loan });
  }
);

/**
 * Mark an approved loan as disbursed and record disbursement details.
 * Expects loan id in route params.
 */
export const disburseApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const loanId = req.params.id as string;
    const loan = await disburseLoan(loanId, req.user!.id);
    sendSuccess(res, 200, MESSAGES.LOAN.DISBURSED, { loan });
  }
);

/**
 * Fetch loans belonging to the authenticated borrower.
 */
export const getMyLoans = asyncHandler(
  async (req: Request, res: Response) => {
    const loans = await getBorrowerLoans(req.user!.id);
    sendSuccess(res, 200, MESSAGES.LOAN.FETCH_SUCCESS, { loans });
  }
);

/**
 * Admin: fetch all loans with optional filtering and pagination.
 * Query params: `status`, `page`, `limit`.
 */
export const getLoans = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;

  const result = await getAllLoans({
    status: status as string | undefined,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  sendSuccess(res, 200, MESSAGES.LOAN.FETCH_SUCCESS, result);
});

/**
 * Retrieve a single loan by id.
 */
export const getLoan = asyncHandler(async (req: Request, res: Response) => {
  const loanId = req.params.id as string;
  const loan = await getLoanById(loanId);
  sendSuccess(res, 200, MESSAGES.LOAN.FETCH_SUCCESS, { loan });
});

/**
 * Fetch sales leads for reporting or sales dashboards.
 */
export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const leads = await getSalesLeads();
  sendSuccess(res, 200, MESSAGES.GENERAL.FETCH_SUCCESS, { leads });
});