export const ROLES = {
  BORROWER: "borrower",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DASHBOARD_ROLES: Role[] = [
  ROLES.SALES,
  ROLES.SANCTION,
  ROLES.DISBURSEMENT,
  ROLES.COLLECTION,
  ROLES.ADMIN,
];