import { roundToTwo } from "../utils/formatters";

interface LoanCalculationInput {
  principal: number;
  tenureDays: number;
  annualRate: number;
}

interface LoanCalculationResult {
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

/**
 * Calculates simple interest using assignment formula:
 * SI = (P × R × T) / (365 × 100)
 * Total Repayment = P + SI
 */
export const calculateLoan = (
  input: LoanCalculationInput
): LoanCalculationResult => {
  const { principal, tenureDays, annualRate } = input;

  const interestAmount = roundToTwo(
    (principal * annualRate * tenureDays) / (365 * 100)
  );

  const totalRepayment = roundToTwo(principal + interestAmount);

  return {
    interestRate: annualRate,
    interestAmount,
    totalRepayment,
  };
};