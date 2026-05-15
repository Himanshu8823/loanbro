export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: "Account created successfully",
    LOGIN_SUCCESS: "Logged in successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "An account with this email already exists",
    UNAUTHORIZED: "Authentication required. Please log in",
    FORBIDDEN: "You do not have permission to perform this action",
    USER_NOT_FOUND: "User not found",
    ACCOUNT_INACTIVE: "Your account has been deactivated. Contact support",
    ME_SUCCESS: "User profile fetched successfully",
  },

  LOAN: {
    DRAFT_CREATED: "Application started. Complete all steps to apply",
    APPLIED: "Loan application submitted successfully",
    NOT_FOUND: "Loan not found",
    ALREADY_APPLIED: "You already have an active loan application",
    SANCTIONED: "Loan sanctioned successfully",
    REJECTED: "Loan rejected",
    DISBURSED: "Loan disbursed successfully",
    CLOSED: "Loan closed successfully",
    INVALID_TRANSITION: "Invalid loan status transition",
    FETCH_SUCCESS: "Loans fetched successfully",
    UPDATE_SUCCESS: "Loan updated successfully",
    REJECTION_REASON_REQUIRED: "Rejection reason is required",
  },

  BRE: {
    AGE_FAIL: "Applicant age must be between 23 and 50 years",
    SALARY_FAIL: "Monthly salary must be at least ₹25,000",
    PAN_FAIL: "Invalid PAN number format",
    EMPLOYMENT_FAIL: "Unemployed applicants are not eligible for a loan",
    PASS: "Eligibility check passed",
  },

  PAYMENT: {
    RECORDED: "Payment recorded successfully",
    UTR_EXISTS: "A payment with this UTR number already exists",
    INVALID_AMOUNT: "Payment amount cannot exceed outstanding balance",
    LOAN_NOT_DISBURSED: "Payments can only be recorded for disbursed loans",
    FETCH_SUCCESS: "Payments fetched successfully",
    ZERO_AMOUNT: "Payment amount must be greater than zero",
  },

  UPLOAD: {
    SUCCESS: "Salary slip uploaded successfully",
    INVALID_TYPE: "Only PDF, JPG, and PNG files are allowed",
    SIZE_EXCEEDED: "File size must not exceed 5MB",
    REQUIRED: "Salary slip is required to proceed",
  },

  GENERAL: {
    SERVER_ERROR: "An unexpected error occurred. Please try again",
    VALIDATION_ERROR: "Validation failed",
    NOT_FOUND: "Resource not found",
    FETCH_SUCCESS: "Data fetched successfully",
  },
} as const;