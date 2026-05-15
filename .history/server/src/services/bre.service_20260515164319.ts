import { EMPLOYMENT_TYPES, EmploymentType } from "../constants/employment";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/app-error";

interface BREInput {
  dateOfBirth: Date;
  monthlySalary: number;
  panNumber: string;
  employmentType: EmploymentType;
}

interface BREResult {
  passed: boolean;
  reason?: string;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const runBRE = (input: BREInput): BREResult => {
  const { dateOfBirth, monthlySalary, panNumber, employmentType } = input;

  const age = calculateAge(dateOfBirth);
  if (age < 23 || age > 50) {
    return { passed: false, reason: MESSAGES.BRE.AGE_FAIL };
  }

  if (monthlySalary < 25000) {
    return { passed: false, reason: MESSAGES.BRE.SALARY_FAIL };
  }

  if (!PAN_REGEX.test(panNumber.toUpperCase())) {
    return { passed: false, reason: MESSAGES.BRE.PAN_FAIL };
  }

  if (employmentType === EMPLOYMENT_TYPES.UNEMPLOYED) {
    return { passed: false, reason: MESSAGES.BRE.EMPLOYMENT_FAIL };
  }

  return { passed: true };
};

export const assertBREPass = (input: BREInput): void => {
  const result = runBRE(input);
  if (!result.passed) {
    throw new AppError(result.reason!, 400);
  }
};