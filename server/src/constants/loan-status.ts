export const LOAN_STATUS = {
  DRAFT: "draft",
  APPLIED: "applied",
  SANCTIONED: "sanctioned",
  REJECTED: "rejected",
  DISBURSED: "disbursed",
  CLOSED: "closed",
} as const;

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

// Enforced in service layer — no invalid transitions possible
export const VALID_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  [LOAN_STATUS.DRAFT]: [LOAN_STATUS.APPLIED],
  [LOAN_STATUS.APPLIED]: [LOAN_STATUS.SANCTIONED, LOAN_STATUS.REJECTED],
  [LOAN_STATUS.SANCTIONED]: [LOAN_STATUS.DISBURSED],
  [LOAN_STATUS.REJECTED]: [],
  [LOAN_STATUS.DISBURSED]: [LOAN_STATUS.CLOSED],
  [LOAN_STATUS.CLOSED]: [],
};