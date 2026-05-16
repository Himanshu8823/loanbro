export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const ROLES = {
  BORROWER: "borrower",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  ADMIN: "admin",
} as const;

export const LOAN_STATUS = {
  DRAFT: "draft",
  APPLIED: "applied",
  SANCTIONED: "sanctioned",
  REJECTED: "rejected",
  DISBURSED: "disbursed",
  CLOSED: "closed",
} as const;

export const EMPLOYMENT_TYPES = {
  SALARIED: "salaried",
  SELF_EMPLOYED: "self-employed",
  UNEMPLOYED: "unemployed",
} as const;

// Borrower protected routes
export const BORROWER_ROUTES = ["/", "/application", "/loan", "/profile"];

// Dashboard protected routes
export const DASHBOARD_ROUTES = [
  "/dashboard/admin",
  "/dashboard/sales",
  "/dashboard/sanction",
  "/dashboard/disbursement",
  "/dashboard/collection",
];

// Role to dashboard route map — used after login redirect
export const ROLE_REDIRECT: Record<string, string> = {
  [ROLES.BORROWER]: "/application",
  [ROLES.SALES]: "/dashboard/sales",
  [ROLES.SANCTION]: "/dashboard/sanction",
  [ROLES.DISBURSEMENT]: "/dashboard/disbursement",
  [ROLES.COLLECTION]: "/dashboard/collection",
  [ROLES.ADMIN]: "/dashboard/admin",
};

export const COOKIE_NAME = "lms_token";