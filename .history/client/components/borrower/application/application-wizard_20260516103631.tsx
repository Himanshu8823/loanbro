"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useMyLoans } from "@/hooks/use-loans";
import { LOAN_STATUS } from "@/lib/constants";
import { Loan } from "@/types/loan.types";
import { StepIndicator } from "./step-indicator";
import { StepPersonalDetails } from "./step-personal-details";
import { StepUploadSlip } from "./step-upload-slip";
import { StepLoanConfig } from "./step-loan-config";
import { ApplicationSuccess } from "./application-success";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loan, LoanStatus } from "@/types/loan.types";

const STEPS = [
  { number: 1, label: "Personal Details" },
  { number: 2, label: "Salary Slip" },
  { number: 3, label: "Loan Config" },
  { number: 4, label: "Done" },
];

/**
 * Determines which step to resume from based on existing draft loan.
 * No salarySlip → Step 2, salarySlip exists → Step 3.
 */
const getResumeStep = (loan: Loan): number => {
  if (!loan.salarySlip) return 2;
  return 3;
};

export function ApplicationWizard() {
  const { data: loans, isLoading } = useMyLoans();

  // Find any active draft loan to resume from
  const draftLoan = useMemo(
    () => loans?.find((l) => l.status === LOAN_STATUS.DRAFT) ?? null,
    [loans]
  );

  const ACTIVE_STATUSES: LoanStatus[] = [
  LOAN_STATUS.APPLIED,
  LOAN_STATUS.SANCTIONED,
  LOAN_STATUS.DISBURSED,
  LOAN_STATUS.CLOSED,
];

const hasApplied = useMemo(
  () => loans?.some((l) => ACTIVE_STATUSES.includes(l.status)) ?? false,
  [loans]
);

  const initialStep = draftLoan ? getResumeStep(draftLoan) : 1;
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [loanId, setLoanId] = useState<string>(draftLoan?._id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Borrower already has an active/completed application
  if (hasApplied) {
    return (
      <Card className="w-full max-w-xl mx-auto shadow-sm border-slate-200">
        <CardContent className="py-10 text-center">
          <p className="text-slate-600 font-medium">
            You already have an active loan application.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Visit the loan status page to track your application.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stepTitles: Record<number, { title: string; description: string }> = {
    1: {
      title: "Personal Details",
      description: "Fill in your details. We'll check your eligibility instantly.",
    },
    2: {
      title: "Upload Salary Slip",
      description: "Upload your latest salary slip (PDF, JPG, PNG — max 5MB).",
    },
    3: {
      title: "Loan Configuration",
      description: "Choose your loan amount and tenure. See the repayment instantly.",
    },
    4: {
      title: "Application Submitted",
      description: "Your application is under review.",
    },
  };

  const activeTitle = stepTitles[currentStep];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-slate-800">
          {activeTitle.title}
        </CardTitle>
        <CardDescription className="text-slate-500">
          {activeTitle.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {currentStep < 4 && (
          <StepIndicator
            steps={STEPS.slice(0, 3)}
            currentStep={currentStep}
          />
        )}

        {currentStep === 1 && (
          <StepPersonalDetails
            onSuccess={(id) => {
              setLoanId(id);
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <StepUploadSlip
            loanId={loanId}
            onSuccess={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepLoanConfig
            loanId={loanId}
            onSuccess={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && <ApplicationSuccess />}
      </CardContent>
    </Card>
  );
}