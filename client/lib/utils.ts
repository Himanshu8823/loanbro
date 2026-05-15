import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

/** Simple interest formula from assignment: SI = (P × R × T) / (365 × 100) */
export const calculateSI = (
  principal: number,
  rate: number,
  tenureDays: number
): { interest: number; total: number } => {
  const interest = parseFloat(
    ((principal * rate * tenureDays) / (365 * 100)).toFixed(2)
  );
  const total = parseFloat((principal + interest).toFixed(2));
  return { interest, total };
};