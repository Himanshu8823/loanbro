import { z } from "zod";
import { EMPLOYMENT_TYPES } from "../constants/employment";

export const startLoanSchema = z.object({
  panNumber: z
    .string()
    .min(1, "PAN number is required")
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),

  monthlySalary: z
    .number()
    .min(1, "Monthly salary is required")
    .positive("Monthly salary must be positive"),

  employmentType: z.enum([
    EMPLOYMENT_TYPES.SALARIED,
    EMPLOYMENT_TYPES.SELF_EMPLOYED,
    EMPLOYMENT_TYPES.UNEMPLOYED,
  ], { error: "Employment type is required" }),

  address: z.object({
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
});

export const applyLoanSchema = z.object({
  loanAmount: z
    .number()
    .min(50000, "Minimum loan amount is ₹50,000")
    .max(500000, "Maximum loan amount is ₹5,00,000"),

  tenureDays: z
    .number()
    .min(30, "Minimum tenure is 30 days")
    .max(365, "Maximum tenure is 365 days"),
});

export type StartLoanInput = z.infer<typeof startLoanSchema>;
export type ApplyLoanInput = z.infer<typeof applyLoanSchema>;