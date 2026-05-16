# Backend Architecture - Comprehensive Documentation

## Table of Contents
1. [Directory Structure](#directory-structure)
2. [API Routes](#api-routes)
3. [Authentication System](#authentication-system)
4. [Database Models & Relationships](#database-models--relationships)
5. [Role-Based Authorization](#role-based-authorization)
6. [Services & Business Logic](#services--business-logic)
7. [Validation System](#validation-system)
8. [Error Handling & API Response](#error-handling--api-response-patterns)
9. [Middleware Stack](#middleware-stack)
10. [Complete Workflow](#complete-workflow)

---

## Directory Structure

```
server/
├── src/
│   ├── app.ts                    - Express application setup & middleware
│   ├── server.ts                 - Entry point & server startup
│   ├── config/
│   │   ├── env.ts               - Environment variables & config
│   │   ├── db.ts                - MongoDB connection
│   │   ├── cookie.ts            - Cookie configuration (JWT tokens)
│   │   └── cloudinary.ts        - File upload service config
│   ├── constants/
│   │   ├── roles.ts             - User roles definition
│   │   ├── loan-status.ts       - Loan lifecycle statuses
│   │   ├── employment.ts        - Employment types
│   │   └── messages.ts          - API response messages
│   ├── controllers/
│   │   ├── auth.controller.ts   - Auth endpoints (register, login, logout)
│   │   ├── loan.controller.ts   - Loan endpoints (apply, sanction, disburse)
│   │   └── payment.controller.ts - Payment endpoints (record, fetch)
│   ├── middlewares/
│   │   ├── auth.middleware.ts   - JWT verification & token extraction
│   │   ├── role.middleware.ts   - Role-based access control
│   │   ├── validate.middleware.ts - Request validation (Zod schemas)
│   │   └── upload.middleware.ts - File upload handling (Multer)
│   ├── models/
│   │   ├── user.model.ts        - User schema with password hashing
│   │   ├── loan.model.ts        - Loan application schema
│   │   └── payment.model.ts     - Payment records schema
│   ├── routes/
│   │   ├── auth.routes.ts       - /api/auth/* endpoints
│   │   ├── loan.routes.ts       - /api/loans/* endpoints
│   │   └── payment.routes.ts    - /api/loans/:id/payments/* endpoints
│   ├── services/
│   │   ├── auth.service.ts      - User registration & login logic
│   │   ├── token.service.ts     - JWT token creation & verification
│   │   ├── loan.service.ts      - Loan lifecycle management
│   │   ├── payment.service.ts   - Payment processing with transactions
│   │   ├── bre.service.ts       - Business Rule Engine (eligibility check)
│   │   ├── loan-calculation.service.ts - Interest & repayment calculation
│   │   └── upload.service.ts    - Cloudinary file upload
│   ├── types/
│   │   ├── auth.types.ts        - Auth-related TypeScript types
│   │   ├── common.types.ts      - Common API response types
│   │   ├── loan.types.ts        - Loan-related types
│   │   ├── payment.types.ts     - Payment-related types
│   │   └── express.d.ts         - Express Request augmentation
│   ├── utils/
│   │   ├── api-response.ts      - Standardized response helpers
│   │   ├── app-error.ts         - Custom error class
│   │   ├── async-handler.ts     - Async error wrapper
│   │   ├── formatters.ts        - Data formatting utilities
│   │   └── generate-user-code.ts - User code generation
│   ├── validators/
│   │   ├── auth.validator.ts    - Registration & login validation
│   │   ├── loan.validator.ts    - Loan application validation
│   │   └── payment.validator.ts - Payment validation
│   └── seeders/
│       └── seed-users.ts        - Database seed script
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## API Routes

### Authentication Routes (`/api/auth`)
```
POST   /register         - Register new borrower
  Input:  { fullName, email, password, phoneNumber }
  Output: { user, token in cookie }

POST   /login            - Login user
  Input:  { email, password }
  Output: { user, token in cookie }

POST   /logout           - Logout (protected)
  Output: Clear token cookie

GET    /me               - Get current user (protected)
  Output: { user }
```

### Loan Routes (`/api/loans`)
```
# BORROWER Routes
POST   /start            - Start new loan application (protected, borrower)
  Input:  { panNumber, dateOfBirth, monthlySalary, employmentType, address }
  Output: { loan (draft) }

PATCH  /:id/upload-slip  - Upload salary slip (protected, borrower)
  Input:  multipart file (salarySlip)
  Output: { loan with attached slip }

PATCH  /:id/apply        - Submit loan application (protected, borrower)
  Input:  { loanAmount, tenureDays }
  Output: { loan (applied status) }

GET    /my-loans         - Fetch borrower's loans (protected, borrower)
  Output: { loans: [...] }

# OPERATIONS Routes (Admin, Sales, Sanction, Disbursement, Collection)
GET    /                 - Fetch all loans with pagination & filtering (protected)
  Query:  ?status=applied&page=1&limit=10
  Output: { loans: [...], total }

GET    /leads            - Fetch sales leads (protected, sales/admin)
  Output: { leads: [{ id, name, hasApplied }] }

GET    /:id              - Get loan details (protected, admin/operations)
  Output: { loan }

PATCH  /:id/sanction     - Approve/reject loan (protected, sanction/admin)
  Input:  { action: "approve"|"reject", rejectionReason? }
  Output: { loan (sanctioned/rejected) }

PATCH  /:id/disburse     - Mark loan as disbursed (protected, disbursement/admin)
  Output: { loan (disbursed status) }
```

### Payment Routes (`/api/loans/:id/payments`)
```
POST   /                 - Record payment (protected, collection/admin)
  Input:  { utrNumber, amount, paymentDate }
  Output: { payment, loanClosed }

GET    /                 - Fetch payments for loan (protected, collection/disbursement/admin)
  Output: { payments: [...] }

GET    /my-payments      - Fetch borrower's payments (protected, borrower)
  Output: { payments: [...] }
```

---

## Authentication System

### JWT Token Structure
```typescript
interface JwtPayload {
  id: string;           // User MongoDB ObjectId
  role: Role;          // User role (borrower, sales, etc.)
  email: string;       // User email
}
```

### Token Service (`token.service.ts`)
```typescript
signToken(payload: JwtPayload): string
  - Creates JWT signed with jwtSecret
  - Expiration: 7 days (configurable)
  - Algorithm: HS256 (default)

verifyToken(token: string): JwtPayload
  - Validates JWT signature
  - Checks expiration
  - Returns decoded payload
  - Throws error on invalid/expired token
```

### Auth Middleware (`auth.middleware.ts`)
```typescript
protect(req, res, next)
  - Extracts JWT from cookies (lms_token)
  - Verifies token validity
  - Attaches user data to req.user
  - Returns 401 if missing or invalid
  - Delegates JWT errors to global error handler
```

### Cookie Configuration
```typescript
AUTH_COOKIE_OPTIONS: {
  httpOnly: true,      // Not accessible from JavaScript
  secure: true,        // HTTPS only in production
  sameSite: "strict",  // CSRF protection
  maxAge: 7 days,      // Token lifetime
  path: "/"
}

COOKIE_NAME: "lms_token"
```

### Password Security
- **Hashing**: bcrypt with salt rounds = 12
- **Pre-save Hook**: Automatically hashes on user creation
- **Comparison**: `comparePassword()` method uses bcrypt.compare
- **JSON Output**: Password never included in JSON responses

---

## Database Models & Relationships

### User Model (`user.model.ts`)
```typescript
interface IUser {
  fullName: string;
  email: string;        // Unique, lowercase
  password: string;     // Hashed with bcrypt
  phoneNumber: string;  // Indian format (10 digits)
  role: Role;          // borrower, sales, sanction, disbursement, collection, admin
  userCode: string;    // Generated: PREFIX-0001 (e.g., BR-0001)
  panNumber?: string;  // Uppercase, validated format
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  isActive: boolean;   // Account status
  timestamps: true;    // createdAt, updatedAt
}

Indexes:
- email (unique)
- role
- userCode (sparse, unique)
```

### Loan Model (`loan.model.ts`)
```typescript
interface ILoanDocument {
  borrower: ObjectId;           // Reference to User
  monthlySalary: number;
  employmentType: EmploymentType;
  salarySlip: {                // Embedded document
    fileName: string;
    fileUrl: string;          // Cloudinary URL
    fileType: "pdf"|"jpg"|"jpeg"|"png";
    fileSize: number;
    uploadedAt: Date;
  } | null;
  
  // Loan Terms
  loanAmount: number;
  tenureDays: number;          // 30-365 days
  interestRate: number;        // Fixed 12% per annum
  interestAmount: number;      // Calculated
  totalRepayment: number;      // Principal + Interest
  
  // Repayment Tracking
  paidAmount: number;          // Cumulative payments
  outstandingAmount: number;   // totalRepayment - paidAmount
  
  // Status & Tracking
  status: LoanStatus;          // draft → applied → sanctioned → disbursed → closed
  rejectionReason?: string;
  sanctionedBy?: ObjectId;     // Reference to sanctioning officer
  disbursedBy?: ObjectId;      // Reference to disbursing officer
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  timestamps: true;            // createdAt, updatedAt
}

Indexes:
- borrower + status (composite)
- status (for filtering)

Status Transitions (Enforced):
draft          → applied
applied        → sanctioned, rejected
sanctioned     → disbursed
rejected       → (no transition)
disbursed      → closed
closed         → (no transition)
```

### Payment Model (`payment.model.ts`)
```typescript
interface IPaymentDocument {
  loan: ObjectId;        // Reference to Loan
  borrower: ObjectId;    // Reference to User (for quick lookup)
  utrNumber: string;     // Unique transaction reference
  amount: number;        // Payment amount
  paymentDate: Date;     // When payment was made
  collectedBy: ObjectId; // Reference to collection officer
  createdAt: Date;       // Auto-generated on insert
}

Indexes:
- utrNumber (unique)
- loan (for loan's payment history)
- borrower (for borrower's payment history)
```

### Relationships
```
User (1) ─── (N) Loan
  │               │
  │               └─── (N) Payment
  │
  └─── Payment (as collectedBy)

User.role determines:
  - Available endpoints
  - Dashboard access
  - Data visibility
```

---

## Role-Based Authorization

### Defined Roles
```typescript
ROLES = {
  BORROWER: "borrower",          // Loan applicants
  SALES: "sales",                // Lead generation & customer engagement
  SANCTION: "sanction",          // Approve/reject loan applications
  DISBURSEMENT: "disbursement",  // Release funds
  COLLECTION: "collection",      // Collect payments
  ADMIN: "admin"                 // Full system access
}

DASHBOARD_ROLES = [SALES, SANCTION, DISBURSEMENT, COLLECTION, ADMIN]
  (Only these roles can access operational dashboards)
```

### Authorization Middleware (`role.middleware.ts`)
```typescript
authorize(...allowedRoles: Role[])
  - Returns middleware function
  - Checks if req.user.role is in allowedRoles
  - Returns 403 Forbidden if unauthorized
  - Returns 401 Unauthorized if no user attached

Usage:
  router.patch("/:id/sanction", 
    protect,                           // Verify JWT
    authorize(ROLES.SANCTION, ROLES.ADMIN),  // Check role
    controller
  )
```

### Role-Specific Permissions

| Role | Access |
|------|--------|
| **BORROWER** | Start app, Upload slip, Apply loan, View own loans, View own payments |
| **SALES** | View all leads, View loan list |
| **SANCTION** | View loans, Approve/Reject loans |
| **DISBURSEMENT** | View loans, Disburse loans, View payments |
| **COLLECTION** | Record payments, View loan payments |
| **ADMIN** | All endpoints |

---

## Services & Business Logic

### 1. Auth Service (`auth.service.ts`)

#### `registerUser(body: RegisterBody): Promise<IUser>`
**Step 1 of borrower flow**
- Validates email uniqueness
- Generates unique user code (BR-0001, BR-0002, etc.)
- Creates user with bcrypt-hashed password
- Returns new user object

**Validations**:
- Email not already registered
- User code generation based on borrower count

#### `loginUser(email, password): Promise<IUser>`
**Login flow**
- Finds user by email (with password field)
- Compares provided password with hash
- Verifies account is active
- Returns authenticated user
- Throws 401 on invalid credentials
- Throws 403 if account inactive

### 2. Token Service (`token.service.ts`)
- `signToken(payload)`: Creates JWT with 7-day expiration
- `verifyToken(token)`: Validates and decodes JWT

### 3. Loan Service (`loan.service.ts`)

#### `startLoanApplication(borrowerId, data): Promise<ILoanDocument>`
**Step 2: Initialize loan application**
- Checks borrower doesn't have active loan (Draft, Applied, Sanctioned, Disbursed)
- **Runs BRE (Business Rule Engine) checks** ⚠️
- Updates user profile: PAN, DOB, address
- Creates DRAFT loan with monthly salary & employment type
- Returns draft loan object

#### `attachSalarySlip(loanId, borrowerId, salarySlip): Promise<ILoanDocument>`
**Step 3: Upload salary proof**
- Verifies loan exists and belongs to borrower
- Checks loan is in DRAFT status
- Attaches salary slip metadata to loan
- Returns updated loan

#### `applyLoan(loanId, borrowerId, data): Promise<ILoanDocument>`
**Step 4: Submit application**
- Validates loan exists & belongs to borrower
- **Requires salary slip to be uploaded**
- **Calculates loan interest** using fixed 12% rate
- Sets loan amount & tenure
- Calculates: interestAmount, totalRepayment, outstandingAmount
- Transitions: DRAFT → APPLIED
- Returns updated loan

#### `sanctionLoan(loanId, executiveId, action, rejectionReason): Promise<ILoanDocument>`
**Step 5: Approve or Reject**
- Finds loan by ID
- **If reject**: Requires rejectionReason, transitions APPLIED → REJECTED
- **If approve**: Records sanctioningOfficer & timestamp, transitions APPLIED → SANCTIONED
- Enforces status transition rules
- Returns updated loan

#### `disburseLoan(loanId, executiveId): Promise<ILoanDocument>`
**Step 6: Disburse funds**
- Finds loan by ID
- Validates transition: SANCTIONED → DISBURSED
- Records disbursing officer & timestamp
- Returns updated loan

#### `getBorrowerLoans(borrowerId): Promise<ILoanDocument[]>`
- Fetches all loans for borrower
- Sorted by newest first

#### `getAllLoans(filters): Promise<{ loans, total }>`
- Supports filtering by status
- Implements pagination (default: page 1, limit 10)
- Populates borrower details
- Returns paginated result set

#### `getLoanById(loanId): Promise<ILoanDocument>`
- Fetches single loan with full borrower details
- Throws 404 if not found

#### `getSalesLeads(): Promise<Array>`
- Returns all active borrowers
- Includes flag `hasApplied` (whether they've submitted a loan)
- Used by Sales dashboard

### 4. Payment Service (`payment.service.ts`)

#### `recordPayment(loanId, collectedById, data): Promise<{ payment, loanClosed }>`
**Step 7: Record payment**
- **Uses MongoDB transaction for atomicity**
- Validates loan exists & is DISBURSED
- Validates payment amount > 0 and ≤ outstandingAmount
- Checks UTR uniqueness
- Creates payment record
- **Updates loan.paidAmount & loan.outstandingAmount**
- **Auto-closes loan if outstandingAmount ≤ 0**
  - Sets status → CLOSED
  - Records closedAt timestamp
- Returns payment + loanClosed flag
- Rolls back on any error

#### `getPaymentsByLoan(loanId): Promise<IPaymentDocument[]>`
- Fetches all payments for loan
- Populates collection officer details
- Sorted by payment date descending

#### `getPaymentsByBorrower(borrowerId): Promise<IPaymentDocument[]>`
- Fetches all payments made by borrower
- Populates loan details
- Sorted by payment date descending

### 5. BRE Service (`bre.service.ts`) - Business Rule Engine

#### `runBRE(input: BREInput): BREResult`
**Eligibility checks performed in sequence**

1. **Age Check**
   - Must be between 23-50 years (inclusive)
   - Accounts for whether birthday has occurred this year
   - Fail: ₹Applicant age must be between 23 and 50 years"

2. **Salary Check**
   - Minimum monthly salary: ₹25,000
   - Fail: "Monthly salary must be at least ₹25,000"

3. **PAN Check**
   - Format: AAAAA9999A (5 letters, 4 digits, 1 letter)
   - Regex: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`
   - Fail: "Invalid PAN number format"

4. **Employment Check**
   - Cannot be UNEMPLOYED
   - Fail: "Unemployed applicants are not eligible for a loan"

#### `assertBREPass(input): void`
- Wrapper that throws AppError if BRE fails
- Used in service layer before creating loan draft

### 6. Loan Calculation Service (`loan-calculation.service.ts`)

#### `calculateLoan(input): LoanCalculationResult`
**Simple Interest Formula**
```
Interest Amount = (Principal × Rate × Time) / (365 × 100)
Total Repayment = Principal + Interest Amount
```

**Parameters**:
- `principal`: Loan amount requested
- `tenureDays`: Loan tenure (30-365 days)
- `annualRate`: Fixed 12% per annum

**Example**:
```
Principal: ₹100,000
Tenure: 90 days
Rate: 12% p.a.

Interest = (100,000 × 12 × 90) / (365 × 100)
        = 108,000,000 / 36,500
        = ₹2,958.90

Total Repayment = ₹100,000 + ₹2,958.90 = ₹102,958.90
```

### 7. Upload Service (`upload.service.ts`)

#### `uploadSalarySlip(file, folder): Promise<ISalarySlip>`
- Validates file type: PDF, JPG, PNG only
- Validates file size: ≤ 5MB
- Streams file to Cloudinary using upload_stream
- PDFs uploaded as resource_type "raw"
- Returns salary slip metadata:
  - fileName, fileUrl, fileType, fileSize, uploadedAt
- Throws error if validation fails or upload fails

---

## Validation System

### Validation Middleware (`validate.middleware.ts`)
```typescript
validate(schema: ZodSchema)
  - Middleware factory
  - Uses Zod schema to validate req.body
  - Returns 422 with field-level errors if validation fails
  - Parses & transforms data before passing to controller
```

### Auth Validator (`auth.validator.ts`)
```typescript
registerSchema: z.object({
  fullName: string (3-100 chars)
  email: valid email
  password: 8+ chars, with uppercase, lowercase, number, special char
  phoneNumber: 10-digit Indian mobile (starts with 6-9)
})

loginSchema: z.object({
  email: valid email
  password: any string (checked in service)
})
```

### Loan Validator (`loan.validator.ts`)
```typescript
startLoanSchema: z.object({
  panNumber: PAN format validation
  dateOfBirth: valid date
  monthlySalary: positive number
  employmentType: enum [salaried, self-employed, unemployed]
  address: {
    street: required string
    city: required string
    state: required string
    pincode: 6-digit string
  }
})

applyLoanSchema: z.object({
  loanAmount: 50,000 - 5,00,000 (₹50K to ₹5L)
  tenureDays: 30 - 365 days
})
```

### Payment Validator (`payment.validator.ts`)
```typescript
recordPaymentSchema: z.object({
  utrNumber: 6-50 char string (uppercase)
  amount: positive number
  paymentDate: valid date
})
```

---

## Error Handling & API Response Patterns

### Custom Error Class (`app-error.ts`)
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean = true;
  
  constructor(message: string, statusCode: number)
}

Usage:
  throw new AppError("Loan not found", 404)
  throw new AppError("Invalid transition", 400)
```

### Response Helpers (`api-response.ts`)
```typescript
sendSuccess(res, statusCode, message, data?)
  - Returns: { success: true, message, data? }
  - Status: 200, 201, etc.

sendError(res, statusCode, message, errors?)
  - Returns: { success: false, message, errors? }
  - Status: 400, 401, 403, 404, etc.

sendResponse(res, statusCode, options)
  - Generic response builder
```

### Global Error Handler (app.ts)
```
Error Handling Hierarchy:
1. AppError (isOperational) → sendError with statusCode
2. MongoDB Duplicate Key (11000) → "Field already exists"
3. Mongoose Validation Error → 422 with field errors
4. JWT JsonWebTokenError → 401 Unauthorized
5. JWT TokenExpiredError → 401 "Session expired"
6. File Size Error (LIMIT_FILE_SIZE) → 413 "File too large"
7. Other errors → 500 (dev: shows message, prod: generic)
```

### Standard API Response Format
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { id, fullName, email, role, userCode, phoneNumber, isActive }
  }
}

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "Password too short" }
  ]
}
```

### HTTP Status Codes Used
- **200**: Success (GET, PATCH without creation)
- **201**: Created (POST successful)
- **400**: Bad Request (validation, invalid state transition)
- **401**: Unauthorized (missing/invalid JWT, session expired)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate key, already applied)
- **413**: Payload Too Large (file size exceeded)
- **422**: Unprocessable Entity (validation error)
- **500**: Internal Server Error (unexpected errors)

---

## Middleware Stack

### Order in Express App
```
1. CORS                          - Cross-origin requests
2. express.json()                - Parse JSON body (10mb limit)
3. express.urlencoded()          - Parse form data
4. cookieParser()                - Parse cookies
5. Route handlers
6. 404 handler                   - Route not found
7. Global error handler          - Catch-all errors
```

### Middleware Stack per Route
```
Public Routes (/register, /login):
  validate(schema) → controller

Protected Routes:
  protect → controller

Protected + Authorized Routes:
  protect → authorize(...roles) → controller

File Upload Routes:
  protect → authorize(...) → uploadSingleFile → controller

Example:
  router.post("/:id/upload-slip", protect, authorize(ROLES.BORROWER), uploadSingleFile, uploadSlip)
```

### Upload Middleware (`upload.middleware.ts`)
```typescript
uploadSingleFile = multer({
  storage: memoryStorage(),      // Store in RAM (not disk)
  limits: {
    fileSize: 5 * 1024 * 1024   // 5MB max
  }
}).single("salarySlip")           // Field name: salarySlip

File stored in req.file:
  - buffer: Buffer
  - originalname: string
  - mimetype: string
  - size: number
```

### Async Handler (`async-handler.ts`)
```typescript
asyncHandler(fn: AsyncController)
  - Wraps async controller functions
  - Catches promise rejections
  - Passes errors to next() for global error handler
  - Eliminates try-catch boilerplate
```

---

## Complete Workflow

### 1. User Registration & Authentication

**Phase 1: Registration**
```
User submits registration form
  ↓
POST /api/auth/register
  ↓
validate(registerSchema)
  - fullName: 3-100 chars
  - email: valid, unique
  - password: 8+ chars, complex
  - phoneNumber: 10-digit Indian
  ↓
registerUser(body)
  - Check email uniqueness
  - Generate userCode (BR-0001)
  - Hash password (bcrypt, salt=12)
  - Create user in DB
  - Return user object
  ↓
signToken({ id, role: BORROWER, email })
  - Create JWT (7-day expiration)
  - Set in lms_token cookie
  ↓
Response 201: { success, message, data: { user } }
```

**Phase 2: Login**
```
User submits login form
  ↓
POST /api/auth/login
  ↓
validate(loginSchema)
  ↓
loginUser(email, password)
  - Find user by email (include password)
  - Compare password with hash
  - Check account is active
  - Return user
  ↓
signToken({ id, role, email })
  ↓
Set cookie lms_token
  ↓
Response 200: { success, message, data: { user } }
```

### 2. Loan Application Submission

**Phase 1: Start Application (Step 2)**
```
Borrower clicks "Apply for Loan"
  ↓
POST /api/loans/start (protected, borrower)
  Input: {
    panNumber: "AAAAA0000A",
    dateOfBirth: "1995-05-15",
    monthlySalary: 50000,
    employmentType: "salaried",
    address: { street, city, state, pincode }
  }
  ↓
validate(startLoanSchema)
  ↓
startLoanApplication(borrowerId, data)
  - Check borrower doesn't have active loan
  - runBRE({dateOfBirth, monthlySalary, panNumber, employmentType})
    ✓ Age 23-50?
    ✓ Salary ≥ ₹25,000?
    ✓ Valid PAN?
    ✓ Not unemployed?
  - Update user: panNumber, dateOfBirth, address
  - Create loan in DRAFT status
  - Return loan
  ↓
Response 201: { success, message, data: { loan } }
  Status: DRAFT (incomplete)
```

**Phase 2: Upload Salary Slip (Step 3)**
```
Borrower uploads salary slip (PDF/JPG/PNG)
  ↓
PATCH /api/loans/:id/upload-slip (protected, borrower)
  File: salarySlip (multipart)
  ↓
uploadSingleFile middleware
  - Validate: PDF/JPG/PNG only
  - Validate: ≤ 5MB
  - Store in req.file
  ↓
uploadSlip controller
  - uploadSalarySlip(file, cloudinaryFolder)
    - Stream to Cloudinary
    - PDFs: resource_type="raw"
    - Return { fileName, fileUrl, fileType, fileSize, uploadedAt }
  ↓
attachSalarySlip(loanId, borrowerId, salarySlip)
  - Find loan (must be DRAFT)
  - Attach salary slip metadata
  - Save & return loan
  ↓
Response 200: { success, message, data: { loan } }
```

**Phase 3: Apply Loan (Step 4)**
```
Borrower submits loan amount & tenure
  ↓
PATCH /api/loans/:id/apply (protected, borrower)
  Input: {
    loanAmount: 100000,      (50K-5L range)
    tenureDays: 90           (30-365 days)
  }
  ↓
validate(applyLoanSchema)
  ↓
applyLoan(loanId, borrowerId, data)
  - Find loan (must be DRAFT, belong to borrower)
  - Check salary slip uploaded ✓
  - calculateLoan({
      principal: 100000,
      tenureDays: 90,
      annualRate: 12
    })
    - Interest = (100K × 12 × 90) / (365 × 100) = ₹2,958.90
    - Total = ₹102,958.90
  - Update loan:
    - loanAmount: 100000
    - tenureDays: 90
    - interestRate: 12
    - interestAmount: 2958.90
    - totalRepayment: 102958.90
    - outstandingAmount: 102958.90
    - paidAmount: 0
    - status: APPLIED
  ↓
Response 200: { success, message, data: { loan } }
  Status: APPLIED (pending sanction)
```

### 3. Loan Approval/Sanction Process

**Sanction Officer Reviews & Approves**
```
Sanction officer accesses loan in /api/loans
  ↓
PATCH /api/loans/:id/sanction (protected, sanction/admin)
  Input: {
    action: "approve" or "reject",
    rejectionReason?: "Does not meet criteria"  (if reject)
  }
  ↓
sanctionLoan(loanId, executiveId, action, rejectionReason)
  - Find loan (must be APPLIED)
  
  If action === "approve":
    - Validate transition: APPLIED → SANCTIONED
    - Set sanctionedBy: executiveId
    - Set sanctionedAt: now()
    - status = SANCTIONED
  
  If action === "reject":
    - Require rejectionReason
    - Validate transition: APPLIED → REJECTED
    - Set rejectionReason
    - status = REJECTED
  
  - Save & return loan
  ↓
Response 200: { success, message, data: { loan } }
  Status: SANCTIONED or REJECTED
```

### 4. Disbursal Process

**Disbursement Officer Releases Funds**
```
Disbursement officer accesses sanctioned loans
  ↓
PATCH /api/loans/:id/disburse (protected, disbursement/admin)
  ↓
disburseLoan(loanId, executiveId)
  - Find loan (must be SANCTIONED)
  - Validate transition: SANCTIONED → DISBURSED
  - Set disbursedBy: executiveId
  - Set disbursedAt: now()
  - status = DISBURSED
  - Save & return loan
  ↓
Response 200: { success, message, data: { loan } }
  Status: DISBURSED (now eligible for payments)

In real system:
  - Funds transferred to borrower's account
  - Payment collection starts
```

### 5. Payment Collection Process

**Collection Executive Records Payments**
```
Collection officer receives payment
  ↓
POST /api/loans/:id/payments (protected, collection/admin)
  Input: {
    utrNumber: "AXIS1234567",  (unique transaction ID)
    amount: 25000,             (≤ outstanding balance)
    paymentDate: "2025-05-16"
  }
  ↓
validate(recordPaymentSchema)
  ↓
recordPayment(loanId, collectedById, data)
  - Start MongoDB transaction
  
  - Find loan (must be DISBURSED)
  - Validate amount > 0 and ≤ outstandingAmount
  - Check UTR uniqueness
  
  - Create payment record:
    { loan, borrower, utrNumber, amount, paymentDate, collectedBy }
  
  - Update loan:
    - paidAmount += 25000
    - outstandingAmount -= 25000
    
    - If outstandingAmount ≤ 0:
      - status = CLOSED
      - closedAt = now()
      - Auto-close on final payment
  
  - Commit transaction
  - Return { payment, loanClosed }
  ↓
Response 201: { success, message, data: { payment, loanClosed } }

Example progression:
  Payment 1: ₹25,000 → Outstanding: ₹77,958.90
  Payment 2: ₹25,000 → Outstanding: ₹52,958.90
  Payment 3: ₹25,000 → Outstanding: ₹27,958.90
  Payment 4: ₹27,958.90 → Outstanding: ₹0 → CLOSED
```

**Borrower Views Payment History**
```
GET /api/loans/my-payments (protected, borrower)
  ↓
getPaymentsByBorrower(borrowerId)
  - Find all payments where borrower = borrowerId
  - Populate loan details
  - Sort by paymentDate descending
  ↓
Response 200: { success, message, data: { payments } }
  Contains: [
    {
      loan: { loanAmount, totalRepayment, status },
      utrNumber, amount, paymentDate, collectedBy
    }
  ]
```

### 6. Complete Loan Lifecycle Timeline

```
DRAFT
  ↓ (User fills info & uploads slip)
APPLIED
  ↓ (Sanction officer reviews)
SANCTIONED (approved) or REJECTED (rejected)
  ↓ (if sanctioned: Disbursement officer releases funds)
DISBURSED
  ↓ (Collection officer records payments)
CLOSED (when outstanding balance = 0)

Timeline Example:
  2025-05-01  DRAFT          (Started application)
  2025-05-05  APPLIED        (Submitted after uploading slip)
  2025-05-10  SANCTIONED     (Approved by sanction officer)
  2025-05-12  DISBURSED      (Funds released)
  2025-06-30  CLOSED         (All payments received)
```

---

## Key Architectural Decisions

### 1. Service Layer Pattern
- Controllers only handle HTTP concerns (req/res)
- All business logic in services
- Services throw AppError, controllers catch via asyncHandler
- Easy to test, reuse, and modify

### 2. Transaction Safety
- Payment recording uses MongoDB sessions
- Atomically updates both Payment & Loan documents
- Ensures data consistency (no partial updates)

### 3. Validation Strategy
- Zod schemas in separate files
- Middleware validates before controllers
- Field-level error reporting
- Type-safe validation results

### 4. Status Transitions
- Defined VALID_TRANSITIONS map
- Enforced in service layer (business logic)
- Prevents invalid state progression
- No UI needed to prevent bad transitions

### 5. File Upload Handling
- Memory storage (small files, no disk I/O)
- Direct stream to Cloudinary
- PDFs treated as raw resource type
- Metadata stored in database

### 6. Security Measures
- JWT in httpOnly cookies (CSRF protected)
- Password hashed with bcrypt (salt=12)
- Role-based access control per endpoint
- Environment variables for secrets
- CORS with credentials: true

### 7. Error Handling
- Centralized global error handler
- Operational vs. non-operational errors
- Detailed development errors, generic production
- Graceful MongoDB connection management

---

## Configuration

### Environment Variables Required
```env
PORT=5000
NODE_ENV=development|production

MONGO_URI=mongodb://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

COOKIE_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=lms/salary-slips
```

### Default Values
- Port: 5000
- JWT Expiry: 7 days
- File Size Limit: 5MB
- Interest Rate: 12% p.a.
- Min Loan: ₹50,000
- Max Loan: ₹5,00,000
- Min Tenure: 30 days
- Max Tenure: 365 days

---

## Database Indexes for Performance

```
users:
  - email (unique)
  - role
  - userCode (sparse, unique)

loans:
  - borrower + status (find active loans)
  - status (fetch by status)

payments:
  - utrNumber (unique)
  - loan (fetch loan's payments)
  - borrower (fetch borrower's payments)
```

---

## API Rate Limiting (Future Enhancement)
Currently not implemented. Recommended:
- 100 requests per 15 minutes per user
- 1000 requests per hour per IP
- Stricter limits for auth endpoints

---

## Logging (Current)
- Console.log for server startup/shutdown
- Error logging to console
- Timestamps from Date objects
- Future: Winston/Morgan for production logging

---

## Testing Strategy (Recommended)

1. **Unit Tests**: Services (BRE, calculations, validators)
2. **Integration Tests**: Complete workflows (register → apply → sanction → disburse → payment)
3. **Route Tests**: All endpoints with various roles
4. **Error Tests**: Invalid transitions, constraint violations
5. **Security Tests**: JWT validation, role enforcement

---

## Performance Optimization

1. ✅ Proper indexing
2. ✅ Pagination support
3. ✅ MongoDB transactions for payment consistency
4. ✅ Lean queries where detail not needed
5. ✅ Cloudinary CDN for file delivery
6. ⏳ Caching (Redis) - Future
7. ⏳ Query optimization - Monitor slow queries

---

This comprehensive architecture ensures:
- **Scalability**: Service layer decoupled from HTTP
- **Maintainability**: Clear separation of concerns
- **Safety**: Type-safe with TypeScript & Zod
- **Security**: JWT, bcrypt, role-based access
- **Reliability**: Transaction support, error handling
- **Extensibility**: Easy to add new roles, statuses, validations
