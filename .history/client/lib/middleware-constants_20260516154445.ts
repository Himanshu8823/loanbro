/**
 * Middleware Constants
 * Edge Runtime compatible constants for Next.js middleware
 * Only includes constants needed by middleware to avoid unsupported module errors
 */

export const ROLES = {
  BORROWER: "borrower",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  ADMIN: "admin",
} as const;

export const COOKIE_NAME = "lms_token";

export const PUBLIC_ROUTES = ["/login", "/signup", "/unauthorized"];

export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  [ROLES.ADMIN]: ["/dashboard"],
  [ROLES.SALES]: ["/dashboard/sales"],
  [ROLES.SANCTION]: ["/dashboard/sanction"],
  [ROLES.DISBURSEMENT]: ["/dashboard/disbursement"],
  [ROLES.COLLECTION]: ["/dashboard/collection"],
  [ROLES.BORROWER]: ["/", "/home", "/application", "/loan", "/profile"],
};
