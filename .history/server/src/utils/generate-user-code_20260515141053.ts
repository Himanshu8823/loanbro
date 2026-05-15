import { ROLES, Role } from "../constants/roles";

const ROLE_PREFIX: Record<Role, string> = {
  [ROLES.BORROWER]: "BR",
  [ROLES.SALES]: "SL",
  [ROLES.SANCTION]: "SC",
  [ROLES.DISBURSEMENT]: "DB",
  [ROLES.COLLECTION]: "CL",
  [ROLES.ADMIN]: "AD",
};

export const generateUserCode = (role: Role, count: number): string => {
  const prefix = ROLE_PREFIX[role];
  const paddedCount = String(count).padStart(4, "0");
  return `${prefix}-${paddedCount}`;
};