export const EMPLOYMENT_TYPES = {
  SALARIED: "salaried",
  SELF_EMPLOYED: "self-employed",
  UNEMPLOYED: "unemployed",
} as const;

export type EmploymentType =
  (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];