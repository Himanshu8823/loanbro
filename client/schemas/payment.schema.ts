import { z } from "zod";

export const recordPaymentSchema = z.object({
  utrNumber: z
    .string()
    .min(1, "UTR number is required")
    .toUpperCase()
    .min(6, "UTR number must be at least 6 characters")
    .max(50, "UTR number must not exceed 50 characters"),

 amount: z
  .number()
  .min(0.01, "Payment amount must be greater than zero"),

  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;