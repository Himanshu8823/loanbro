# Backend Architecture - Code Examples & Technical Details

## Table of Contents
1. [Key Code Snippets](#key-code-snippets)
2. [Service Layer Examples](#service-layer-examples)
3. [Middleware Implementation](#middleware-implementation)
4. [Error Handling Examples](#error-handling-examples)
5. [Type Definitions](#type-definitions)
6. [Configuration Examples](#configuration-examples)

---

## Key Code Snippets

### 1. Express App Setup

```typescript
// app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware stack
app.use(cors({
  origin: env.clientUrl,
  credentials: true,                        // Allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));   // Parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(env.cookieSecret));    // Parse cookies

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/loans", paymentRoutes);

// 404 handler
app.use((_req, res) => {
  sendError(res, 404, "Route not found");
});

// Global error handler
app.use((err: Error, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);

  if ((err as AppError).isOperational) {
    return sendError(res, (err as AppError).statusCode, err.message);
  }

  // Handle MongoDB duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0];
    return sendError(res, 409, `${field} already exists`);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    return sendError(res, 422, "Validation failed", errors);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Session expired. Please log in again");
  }

  // Catch-all
  return sendError(
    res,
    500,
    env.isDev ? err.message : "Internal server error"
  );
});

export default app;
```

### 2. Server Entry Point

```typescript
// server.ts
import { connectDB } from "./config/db";
import { env } from "./config/env";
import app from "./app";

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
      console.log(`Health: http://localhost:${env.port}/health`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Unhandled promise rejections
    process.on("unhandledRejection", (reason: unknown) => {
      console.error("❌ Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

    // Uncaught exceptions
    process.on("uncaughtException", (err: Error) => {
      console.error("❌ Uncaught Exception:", err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

### 3. MongoDB Connection

```typescript
// config/db.ts
import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
};
```

---

## Service Layer Examples

### 1. Authentication Service

```typescript
// services/auth.service.ts
import User, { IUser } from "../models/user.model";
import { ROLES } from "../constants/roles";
import { generateUserCode } from "../utils/generate-user-code";
import { AppError } from "../utils/app-error";

// Step 1: Check email uniqueness
const checkEmailExists = async (email: string): Promise<void> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }
};

// Step 2: Generate user code (BR-0001, BR-0002, etc.)
const generateNextUserCode = async (): Promise<string> => {
  const count = await User.countDocuments({ role: ROLES.BORROWER });
  return generateUserCode(ROLES.BORROWER, count + 1);
};

// Step 3: Verify login credentials
const verifyCredentials = async (
  email: string,
  password: string
): Promise<IUser> => {
  // Include password field explicitly (.select("+password"))
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Use bcrypt comparison (salt verification)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return user;
};

// Step 4: Verify account is active
const verifyAccountActive = (user: IUser): void => {
  if (!user.isActive) {
    throw new AppError("Your account has been deactivated", 403);
  }
};

// Export service methods
export const registerUser = async (body: RegisterBody): Promise<IUser> => {
  const { fullName, email, password, phoneNumber } = body;

  // Check email doesn't exist
  await checkEmailExists(email.toLowerCase().trim());

  // Generate unique user code
  const userCode = await generateNextUserCode();

  // Create user (password auto-hashed via pre-save hook)
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,  // Will be hashed by schema.pre("save")
    phoneNumber: phoneNumber.trim(),
    role: ROLES.BORROWER,
    userCode,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<IUser> => {
  // Verify credentials using bcrypt
  const user = await verifyCredentials(email.toLowerCase().trim(), password);
  
  // Check account is active
  verifyAccountActive(user);
  
  return user;
};
```

### 2. Token Service (JWT)

```typescript
// services/token.service.ts
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  id: string;    // User MongoDB ID
  role: Role;    // User role
  email: string; // User email
}

// Sign token
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],  // "7d"
  });
};

// Verify and decode token
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

// Usage in controller:
// 1. Register/Login → signToken → set in cookie
// 2. Protected route → middleware extracts from cookie
// 3. Middleware → verifyToken → attaches to req.user
```

### 3. Loan Service - Start Application

```typescript
// services/loan.service.ts - startLoanApplication
export const startLoanApplication = async (
  borrowerId: string,
  data: {
    panNumber: string;
    dateOfBirth: string;
    monthlySalary: number;
    employmentType: EmploymentType;
    address: { street, city, state, pincode };
  }
): Promise<ILoanDocument> => {
  // Step 1: Check borrower doesn't have active loan
  const existingLoan = await Loan.findOne({
    borrower: borrowerId,
    status: {
      $in: [
        LOAN_STATUS.DRAFT,
        LOAN_STATUS.APPLIED,
        LOAN_STATUS.SANCTIONED,
        LOAN_STATUS.DISBURSED,
      ],
    },
  });

  if (existingLoan) {
    throw new AppError("You already have an active loan application", 409);
  }

  // Step 2: Run BRE (Business Rule Engine)
  assertBREPass({
    dateOfBirth: new Date(data.dateOfBirth),
    monthlySalary: data.monthlySalary,
    panNumber: data.panNumber,
    employmentType: data.employmentType,
  });

  // Step 3: Update user profile
  await User.findByIdAndUpdate(borrowerId, {
    panNumber: data.panNumber.toUpperCase(),
    dateOfBirth: new Date(data.dateOfBirth),
    address: data.address,
  });

  // Step 4: Create draft loan
  const loan = await Loan.create({
    borrower: borrowerId,
    monthlySalary: data.monthlySalary,
    employmentType: data.employmentType,
    status: LOAN_STATUS.DRAFT,
    // Other fields initialized to defaults in schema
  });

  return loan;
};
```

### 4. Loan Service - Apply Loan with Calculation

```typescript
// services/loan.service.ts - applyLoan
export const applyLoan = async (
  loanId: string,
  borrowerId: string,
  data: { loanAmount: number; tenureDays: number }
): Promise<ILoanDocument> => {
  // Step 1: Find loan
  const loan = await Loan.findOne({ _id: loanId, borrower: borrowerId });

  if (!loan) {
    throw new AppError("Loan not found", 404);
  }

  // Step 2: Validate status transition
  if (loan.status !== LOAN_STATUS.DRAFT) {
    throw new AppError("Invalid loan status transition", 400);
  }

  // Step 3: Check salary slip uploaded
  if (!loan.salarySlip) {
    throw new AppError("Salary slip is required to proceed", 400);
  }

  // Step 4: Calculate interest and repayment
  const FIXED_INTEREST_RATE = 12;
  const { interestRate, interestAmount, totalRepayment } = calculateLoan({
    principal: data.loanAmount,
    tenureDays: data.tenureDays,
    annualRate: FIXED_INTEREST_RATE,
  });

  // Step 5: Update loan document
  loan.loanAmount = data.loanAmount;
  loan.tenureDays = data.tenureDays;
  loan.interestRate = interestRate;
  loan.interestAmount = interestAmount;
  loan.totalRepayment = totalRepayment;
  loan.outstandingAmount = totalRepayment;  // Initially all outstanding
  loan.paidAmount = 0;                      // No payment yet
  loan.status = LOAN_STATUS.APPLIED;        // Transition: DRAFT → APPLIED

  // Step 6: Persist changes
  await loan.save();

  return loan;
};
```

### 5. BRE Service - Business Rule Engine

```typescript
// services/bre.service.ts
import { EMPLOYMENT_TYPES } from "../constants/employment";

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

// Calculate age accurately
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;  // Birthday hasn't occurred yet this year
  }
  
  return age;
};

// Run all BRE rules in sequence
export const runBRE = (input: BREInput): BREResult => {
  const { dateOfBirth, monthlySalary, panNumber, employmentType } = input;

  // Rule 1: Age between 23 and 50
  const age = calculateAge(dateOfBirth);
  if (age < 23 || age > 50) {
    return { 
      passed: false, 
      reason: "Applicant age must be between 23 and 50 years" 
    };
  }

  // Rule 2: Minimum salary
  if (monthlySalary < 25000) {
    return { 
      passed: false, 
      reason: "Monthly salary must be at least ₹25,000" 
    };
  }

  // Rule 3: Valid PAN format
  if (!PAN_REGEX.test(panNumber.toUpperCase())) {
    return { 
      passed: false, 
      reason: "Invalid PAN number format" 
    };
  }

  // Rule 4: Not unemployed
  if (employmentType === EMPLOYMENT_TYPES.UNEMPLOYED) {
    return { 
      passed: false, 
      reason: "Unemployed applicants are not eligible for a loan" 
    };
  }

  // All rules passed
  return { passed: true };
};

// Throw error if BRE fails
export const assertBREPass = (input: BREInput): void => {
  const result = runBRE(input);
  if (!result.passed) {
    throw new AppError(result.reason!, 400);
  }
};
```

### 6. Loan Calculation Service

```typescript
// services/loan-calculation.service.ts
interface LoanCalculationInput {
  principal: number;     // Loan amount
  tenureDays: number;    // Loan duration
  annualRate: number;    // Annual interest rate
}

interface LoanCalculationResult {
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

/**
 * Simple Interest Formula:
 * SI = (P × R × T) / (365 × 100)
 * 
 * Where:
 * P = Principal (loan amount)
 * R = Rate of interest per annum (%)
 * T = Time period (in days)
 * 365 = days in a year
 * 100 = percentage conversion
 */
export const calculateLoan = (
  input: LoanCalculationInput
): LoanCalculationResult => {
  const { principal, tenureDays, annualRate } = input;

  // Calculate simple interest
  const interestAmount = roundToTwo(
    (principal * annualRate * tenureDays) / (365 * 100)
  );

  // Total repayment = Principal + Interest
  const totalRepayment = roundToTwo(principal + interestAmount);

  return {
    interestRate: annualRate,
    interestAmount,
    totalRepayment,
  };
};

// Example:
// Input: Principal = ₹100,000, Tenure = 90 days, Rate = 12% p.a.
// Interest = (100000 × 12 × 90) / (365 × 100) = ₹2,958.90
// Total = ₹102,958.90
```

### 7. Payment Service with Transactions

```typescript
// services/payment.service.ts
import mongoose from "mongoose";

/**
 * Records a payment against a disbursed loan.
 * Uses MongoDB transaction for atomicity:
 * - Either both Payment & Loan are updated
 * - Or neither (on error)
 * - No partial updates
 */
export const recordPayment = async (
  loanId: string,
  collectedById: string,
  data: { utrNumber: string; amount: number; paymentDate: string }
): Promise<{ payment: IPaymentDocument; loanClosed: boolean }> => {
  // Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch loan (within transaction context)
    const loan = await Loan.findById(loanId).session(session);

    if (!loan) {
      throw new AppError("Loan not found", 404);
    }

    // Validate loan is disbursed
    if (loan.status !== LOAN_STATUS.DISBURSED) {
      throw new AppError("Payments can only be recorded for disbursed loans", 400);
    }

    // Validate payment amount
    if (data.amount <= 0) {
      throw new AppError("Payment amount must be greater than zero", 400);
    }

    if (data.amount > loan.outstandingAmount) {
      throw new AppError("Payment amount cannot exceed outstanding balance", 400);
    }

    // Check UTR uniqueness
    const existingUTR = await Payment.findOne({
      utrNumber: data.utrNumber.toUpperCase(),
    }).session(session);

    if (existingUTR) {
      throw new AppError("A payment with this UTR number already exists", 409);
    }

    // Create payment document
    const [payment] = await Payment.create(
      [
        {
          loan: loanId,
          borrower: loan.borrower,
          utrNumber: data.utrNumber.toUpperCase(),
          amount: data.amount,
          paymentDate: new Date(data.paymentDate),
          collectedBy: collectedById,
        },
      ],
      { session }  // Use transaction session
    );

    // Update loan: paid amount & outstanding
    const updatedPaid = roundToTwo(loan.paidAmount + data.amount);
    const updatedOutstanding = roundToTwo(loan.outstandingAmount - data.amount);

    loan.paidAmount = updatedPaid;
    loan.outstandingAmount = updatedOutstanding;

    // Auto-close loan if fully repaid
    const loanClosed = updatedOutstanding <= 0;
    if (loanClosed) {
      loan.status = LOAN_STATUS.CLOSED;
      loan.closedAt = new Date();
    }

    // Save loan (within transaction)
    await loan.save({ session });

    // Commit transaction (all changes persist)
    await session.commitTransaction();

    return { payment, loanClosed };
  } catch (err) {
    // Rollback transaction on error (no changes persist)
    await session.abortTransaction();
    throw err;
  } finally {
    // Always close session
    session.endSession();
  }
};
```

---

## Middleware Implementation

### 1. Auth Middleware (JWT Protection)

```typescript
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/token.service";
import { sendError } from "../utils/api-response";
import { COOKIE_NAME } from "../config/cookie";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from cookies
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      sendError(res, 401, "Authentication required. Please log in");
      return;
    }

    // Verify JWT signature and expiration
    const decoded = verifyToken(token);

    // Attach user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    // Continue to next middleware/controller
    next();
  } catch (err) {
    // Pass JWT errors to global error handler
    next(err);
  }
};

// Usage: router.get("/protected", protect, controller)
```

### 2. Role Middleware (Authorization)

```typescript
// middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles";
import { sendError } from "../utils/api-response";

// Higher-order function factory
export const authorize = (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Check user exists (attached by protect middleware)
    if (!req.user) {
      sendError(res, 401, "Authentication required");
      return;
    }

    // Check role is in allowed list
    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, "You do not have permission to perform this action");
      return;
    }

    // Role is authorized, continue
    next();
  };

// Usage:
// router.patch("/:id/sanction", 
//   protect,                                    // 1st: Verify JWT
//   authorize(ROLES.SANCTION, ROLES.ADMIN),    // 2nd: Check role
//   controller                                  // 3rd: Handle request
// )
```

### 3. Validation Middleware (Zod)

```typescript
// middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { sendError } from "../utils/api-response";

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate request body
      req.body = schema.parse(req.body);
      // If valid, continue with transformed data
      next();
    } catch (err) {
      // Handle Zod validation errors
      if (err instanceof ZodError) {
        // Extract field-level errors
        const errors = err.issues.map((e: ZodIssue) => ({
          field: e.path.join("."),  // e.g., "address.pincode"
          message: e.message,       // e.g., "Must be 6 digits"
        }));
        
        // Return 422 Unprocessable Entity
        sendError(res, 422, "Validation failed", errors);
        return;
      }
      
      // Unexpected error, pass to error handler
      next(err);
    }
  };

// Usage:
// router.post("/register", 
//   validate(registerSchema),  // Validates req.body
//   controller
// )
```

### 4. Upload Middleware (Multer)

```typescript
// middlewares/upload.middleware.ts
import multer from "multer";

// Store file in memory (not on disk)
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max
  },
});

// Export single file upload handler
export const uploadSingleFile = upload.single("salarySlip");

// File is available in req.file:
// - buffer: Buffer
// - originalname: string (original filename)
// - mimetype: string (e.g., "application/pdf")
// - size: number (in bytes)

// Usage:
// router.patch("/:id/upload-slip",
//   protect,
//   uploadSingleFile,        // Populates req.file
//   controller
// )
```

### 5. Async Error Handler

```typescript
// utils/async-handler.ts
import { Request, Response, NextFunction } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// Wrapper to catch async errors
const asyncHandler =
  (fn: AsyncController) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Execute async function and catch rejections
    fn(req, res, next).catch(next);  // Pass to error handler
  };

export default asyncHandler;

// Eliminates try-catch boilerplate:

// ❌ Without asyncHandler
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(res, 201, "Success", { user });
  } catch (err) {
    next(err);  // Manual error passing
  }
};

// ✅ With asyncHandler
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);  // Errors auto-caught
  sendSuccess(res, 201, "Success", { user });
});
```

---

## Error Handling Examples

### 1. Custom AppError Class

```typescript
// utils/app-error.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // Identifies expected errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in services:
if (user.isActive) {
  throw new AppError("Account inactive", 403);
}

if (loan.status !== LOAN_STATUS.DISBURSED) {
  throw new AppError("Loan not disbursed", 400);
}
```

### 2. Global Error Handler

```typescript
// app.ts - Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);

  // Handle operational errors
  if ((err as AppError).isOperational) {
    return sendError(res, (err as AppError).statusCode, err.message);
  }

  // Handle MongoDB duplicate key error (E11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0];
    const capitalize = field.charAt(0).toUpperCase() + field.slice(1);
    return sendError(res, 409, `${capitalize} already exists`);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    return sendError(res, 422, "Validation failed", errors);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  // Handle expired JWT
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Session expired. Please log in again");
  }

  // Handle file size error
  if (err.message === "LIMIT_FILE_SIZE") {
    return sendError(res, 413, "File size must not exceed 5MB");
  }

  // Catch-all for unexpected errors
  return sendError(
    res,
    500,
    env.isDev ? err.message : "An unexpected error occurred"
  );
});
```

### 3. Service Layer Error Throwing

```typescript
// services/loan.service.ts
export const startLoanApplication = async (borrowerId, data) => {
  // Check 1: Existing loan
  const existingLoan = await Loan.findOne({...});
  if (existingLoan) {
    throw new AppError(
      "You already have an active loan application",
      409
    );
  }

  // Check 2: BRE validation
  try {
    assertBREPass({...});
  } catch (err) {
    // BRE error is already an AppError, re-throw
    throw err;
  }

  // Continue...
};

// All errors thrown as AppError (statusCode + message)
// Controller wraps with asyncHandler → Global error handler processes
```

---

## Type Definitions

### 1. Auth Types

```typescript
// types/auth.types.ts
import { Role } from "../constants/roles";

export interface JwtPayload {
  id: string;    // User MongoDB ID
  role: Role;    // User role
  email: string; // User email
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginBody {
  email: string;
  password: string;
}
```

### 2. Express Types

```typescript
// types/express.d.ts
import { Role } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}

export {};

// Now req.user is typed in all controllers
```

### 3. Loan Types

```typescript
// types/loan.types.ts
// Contains all loan-related type definitions
import { ILoanDocument } from "../models/loan.model";

export type LoanStatus = "draft" | "applied" | "sanctioned" | "rejected" | "disbursed" | "closed";

export interface LoanFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface LoanCalculationInput {
  principal: number;
  tenureDays: number;
  annualRate: number;
}
```

### 4. API Response Types

```typescript
// types/common.types.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

// Usage:
// const response: ApiResponse<{ user: IUser }> = {
//   success: true,
//   message: "User created",
//   data: { user }
// };
```

---

## Configuration Examples

### 1. Environment Variables

```typescript
// config/env.ts
import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  // Server
  port: parseInt(process.env.PORT ?? "5000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",

  // Database
  mongoUri: requireEnv("MONGO_URI"),

  // JWT
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // Cookies
  cookieSecret: requireEnv("COOKIE_SECRET"),

  // CORS
  clientUrl: requireEnv("CLIENT_URL"),

  // File Upload (Cloudinary)
  cloudinary: {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
    folder: process.env.CLOUDINARY_FOLDER ?? "lms/salary-slips",
  },

  // Flags
  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
} as const;

// .env file example:
// PORT=5000
// NODE_ENV=development
// MONGO_URI=mongodb://localhost:27017/lms
// JWT_SECRET=your-very-secret-key-min-32-chars
// COOKIE_SECRET=another-secret-key
// CLIENT_URL=http://localhost:3000
// CLOUDINARY_CLOUD_NAME=your-cloud-name
// CLOUDINARY_API_KEY=your-api-key
// CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Cookie Configuration

```typescript
// config/cookie.ts
import { CookieOptions } from "express";
import { env } from "./env";

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,      // Not accessible from JavaScript (XSS protection)
  secure: env.isProd,  // HTTPS only in production
  sameSite: "strict",  // CSRF protection
  path: "/",           // Available on all paths
};

// Auth token cookie (7-day expiration)
export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
};

// Clear cookie on logout
export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 0,  // Immediately expires
};

export const COOKIE_NAME = "lms_token";

// Usage in controllers:
// res.cookie(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);      // Set
// res.cookie(COOKIE_NAME, "", CLEAR_COOKIE_OPTIONS);        // Clear
```

### 3. Zod Validation Schema

```typescript
// validators/auth.validator.ts
import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must not exceed 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain: uppercase, lowercase, number, special char"
    ),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Please provide a valid 10-digit Indian mobile number"
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Validation example:
// const data = registerSchema.parse({...});  // Throws if invalid
// const result = registerSchema.safeParse({...});  // Returns { success, data, error }
```

---

## Complete Route Example

```typescript
// routes/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { protect } from "../middlewares/auth.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(registerSchema),  // Validate input
  register                   // Controller
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

// Protected routes
router.post(
  "/logout",
  protect,   // Verify JWT
  logout
);

router.get(
  "/me",
  protect,
  getMe
);

export default router;

// Route stack for POST /register:
// 1. JSON body parsed by express.json()
// 2. Validation middleware: validate(registerSchema)
// 3. Controller: register()
// 4. Error handler (if any throws)

// Route stack for POST /logout:
// 1. JSON body parsed
// 2. Auth middleware: protect (verify JWT)
// 3. Controller: logout()
// 4. Error handler
```

---

## Summary

This document covers:
- ✅ Express app setup and middleware configuration
- ✅ Server startup with graceful shutdown
- ✅ Database connection management
- ✅ Service layer business logic
- ✅ Middleware implementations (auth, validation, upload)
- ✅ Error handling strategy
- ✅ TypeScript type definitions
- ✅ Configuration management
- ✅ Zod validation schemas
- ✅ Complete request-response flow

All code follows best practices:
- Separation of concerns (Controllers → Services)
- Error handling (AppError + global handler)
- Type safety (TypeScript + Zod)
- Security (JWT, bcrypt, CORS, role-based access)
- Transaction support (MongoDB sessions)
- Reusability (middleware factories, service composition)
