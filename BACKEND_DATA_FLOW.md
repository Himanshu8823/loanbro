# Backend Architecture - Data Flow & Quick Reference

## Quick Reference Guides

### API Endpoint Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION ENDPOINTS                      │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/auth/register         Public     Register borrower   │
│ POST   /api/auth/login            Public     Login               │
│ POST   /api/auth/logout           Protected  Logout              │
│ GET    /api/auth/me               Protected  Get profile         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LOAN ENDPOINTS                              │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/loans/start           Protected  Start app (borrower)│
│        Borrower                                                  │
├─────────────────────────────────────────────────────────────────┤
│ PATCH  /api/loans/:id/upload-slip Protected  Upload slip        │
│        Borrower                                                  │
├─────────────────────────────────────────────────────────────────┤
│ PATCH  /api/loans/:id/apply       Protected  Apply for loan     │
│        Borrower                                                  │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/my-loans        Protected  View own loans     │
│        Borrower                                                  │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/                Protected  View all loans     │
│        Admin/Ops                                                 │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/leads           Protected  View sales leads   │
│        Sales/Admin                                               │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/:id             Protected  View loan details  │
│        Admin/Ops                                                 │
├─────────────────────────────────────────────────────────────────┤
│ PATCH  /api/loans/:id/sanction    Protected  Sanction loan      │
│        Sanction/Admin                                            │
├─────────────────────────────────────────────────────────────────┤
│ PATCH  /api/loans/:id/disburse    Protected  Disburse loan      │
│        Disbursement/Admin                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT ENDPOINTS                             │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/loans/:id/payments    Protected  Record payment     │
│        Collection/Admin                                          │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/:id/payments    Protected  View loan payments │
│        Collection/Disbursement/Admin                            │
├─────────────────────────────────────────────────────────────────┤
│ GET    /api/loans/my-payments     Protected  View own payments  │
│        Borrower                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Service Methods at a Glance

```
AUTH SERVICE
├── registerUser(body) → IUser
└── loginUser(email, password) → IUser

TOKEN SERVICE
├── signToken(payload) → string (JWT)
└── verifyToken(token) → JwtPayload

LOAN SERVICE
├── startLoanApplication(borrowerId, data) → ILoanDocument
├── attachSalarySlip(loanId, borrowerId, slip) → ILoanDocument
├── applyLoan(loanId, borrowerId, data) → ILoanDocument
├── sanctionLoan(loanId, executiveId, action, reason?) → ILoanDocument
├── disburseLoan(loanId, executiveId) → ILoanDocument
├── getBorrowerLoans(borrowerId) → ILoanDocument[]
├── getAllLoans(filters) → { loans, total }
├── getLoanById(loanId) → ILoanDocument
└── getSalesLeads() → unknown[]

PAYMENT SERVICE
├── recordPayment(loanId, collectedById, data) → { payment, loanClosed }
├── getPaymentsByLoan(loanId) → IPaymentDocument[]
└── getPaymentsByBorrower(borrowerId) → IPaymentDocument[]

BRE SERVICE
├── runBRE(input) → BREResult
└── assertBREPass(input) → void (throws if fails)

LOAN CALCULATION SERVICE
└── calculateLoan(input) → LoanCalculationResult

UPLOAD SERVICE
└── uploadSalarySlip(file, folder) → Promise<ISalarySlip>
```

### Request/Response Patterns

#### Success Response (200/201)
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    // Resource data here
  }
}
```

#### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Status Codes Reference

| Code | Meaning | When | Example |
|------|---------|------|---------|
| 200 | OK | Successful GET, PATCH | Loan updated |
| 201 | Created | Successful POST | Loan created |
| 400 | Bad Request | Validation, invalid state | Invalid loan amount |
| 401 | Unauthorized | Missing/invalid JWT | Token expired |
| 403 | Forbidden | Insufficient permissions | Non-sanction officer sanctioning |
| 404 | Not Found | Resource doesn't exist | Loan ID not found |
| 409 | Conflict | Duplicate or conflict | Already has active loan |
| 413 | Too Large | File size exceeded | File > 5MB |
| 422 | Unprocessable | Validation error | Missing required field |
| 500 | Server Error | Unexpected error | Database crash |

---

## Data Flow Diagrams

### 1. Authentication Flow

```
┌─────────────────┐
│   User Input    │
│  (Email/Pass)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  POST /api/auth/register            │
│  - validate(registerSchema)         │
│  - registerUser(body)               │
│    • Check email unique             │
│    • Generate userCode (BR-0001)    │
│    • Hash password (bcrypt)         │
│    • Create user in DB              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  signToken({ id, role, email })     │
│  - Create JWT (7-day expiry)        │
│  - Set in lms_token cookie          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Response 201                       │
│  {                                  │
│    success: true,                   │
│    user: {...}                      │
│  }                                  │
│  Cookie: lms_token=...              │
└─────────────────────────────────────┘
```

### 2. Loan Application Flow

```
┌──────────────────────────────────────────────────────────────┐
│           STEP 1: REGISTRATION (see above)                   │
└──────────────────────────────────────────────┬───────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: START APPLICATION                                   │
│  POST /api/loans/start                                       │
│  ├─ validate(startLoanSchema)                                │
│  ├─ startLoanApplication()                                   │
│  │  ├─ Check no active loan exists                           │
│  │  ├─ runBRE()                                              │
│  │  │  ├─ Age 23-50? ✓                                       │
│  │  │  ├─ Salary ≥ ₹25K? ✓                                   │
│  │  │  ├─ Valid PAN? ✓                                       │
│  │  │  └─ Not unemployed? ✓                                  │
│  │  ├─ Update user (PAN, DOB, address)                       │
│  │  └─ Create Loan (DRAFT status)                            │
│  └─ Response: { loan (DRAFT) }                               │
└──────────────────────────────────────────┬───────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: UPLOAD SALARY SLIP                                  │
│  PATCH /api/loans/:id/upload-slip                            │
│  ├─ uploadSingleFile (multer)                                │
│  │  ├─ Validate type (PDF/JPG/PNG)                           │
│  │  ├─ Validate size (≤ 5MB)                                 │
│  │  └─ Store in req.file buffer                              │
│  ├─ uploadSalarySlip()                                       │
│  │  ├─ Stream to Cloudinary                                  │
│  │  └─ Get URL & metadata                                    │
│  ├─ attachSalarySlip()                                       │
│  │  └─ Attach to loan document                               │
│  └─ Response: { loan with slip }                             │
└──────────────────────────────────────────┬───────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: APPLY FOR LOAN                                      │
│  PATCH /api/loans/:id/apply                                  │
│  ├─ validate(applyLoanSchema)                                │
│  │  ├─ loanAmount: 50K-5L                                    │
│  │  └─ tenureDays: 30-365                                    │
│  ├─ applyLoan()                                              │
│  │  ├─ Check salary slip uploaded                            │
│  │  ├─ calculateLoan()                                       │
│  │  │  └─ SI = (P × R × T) / (365 × 100)                    │
│  │  ├─ Update Loan:                                          │
│  │  │  ├─ loanAmount                                         │
│  │  │  ├─ tenureDays                                         │
│  │  │  ├─ interestAmount                                     │
│  │  │  ├─ totalRepayment                                     │
│  │  │  ├─ outstandingAmount = totalRepayment                 │
│  │  │  └─ status: DRAFT → APPLIED                            │
│  │  └─ Save to DB                                            │
│  └─ Response: { loan (APPLIED) }                             │
└──────────────────────────────────────────┬───────────────────┘
                                           │
        ┌──────────────────────────────────┴──────────────────┐
        │                                                     │
        ▼                                                     ▼
┌─────────────────────────┐                     ┌─────────────────────────┐
│  STEP 5A: SANCTION      │                     │  STEP 5B: REJECT        │
│  (Approve)              │                     │  (Reject)               │
├─────────────────────────┤                     ├─────────────────────────┤
│ PATCH /api/loans/:id/   │                     │ PATCH /api/loans/:id/   │
│        sanction         │                     │        sanction         │
│ { action: "approve" }   │                     │ {                       │
│                         │                     │   action: "reject",     │
│ sanctionLoan()          │                     │   rejectionReason: "..." │
│ ├─ Validate transition  │                     │ }                       │
│ ├─ Set sanctionedBy     │                     │                         │
│ ├─ Set sanctionedAt     │                     │ sanctionLoan()          │
│ └─ status: SANCTIONED   │                     │ ├─ Set rejectionReason  │
│                         │                     │ └─ status: REJECTED     │
│ Response: { loan        │                     │                         │
│   (SANCTIONED) }        │                     │ Response: { loan        │
└──────────┬──────────────┘                     │   (REJECTED) }          │
           │                                    └─────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6: DISBURSE                                            │
│  PATCH /api/loans/:id/disburse                               │
│  ├─ disburseLoan()                                           │
│  │  ├─ Validate transition (SANCTIONED → DISBURSED)          │
│  │  ├─ Set disbursedBy                                       │
│  │  ├─ Set disbursedAt                                       │
│  │  └─ status: DISBURSED                                     │
│  ├─ In real system: Transfer funds to borrower's account     │
│  └─ Response: { loan (DISBURSED) }                           │
└──────────────────────────────────────────┬───────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 7: COLLECT PAYMENTS (Repeatable)                       │
│  POST /api/loans/:id/payments                                │
│  ├─ validate(recordPaymentSchema)                            │
│  ├─ Start MongoDB transaction                                │
│  ├─ recordPayment()                                          │
│  │  ├─ Check loan is DISBURSED                               │
│  │  ├─ Validate amount ≤ outstandingAmount                   │
│  │  ├─ Check UTR uniqueness                                  │
│  │  ├─ Create Payment record                                 │
│  │  ├─ Update Loan:                                          │
│  │  │  ├─ paidAmount += amount                               │
│  │  │  ├─ outstandingAmount -= amount                        │
│  │  │  ├─ If outstandingAmount ≤ 0:                          │
│  │  │  │  ├─ status: CLOSED                                  │
│  │  │  │  └─ closedAt = now()                                │
│  │  │  └─ Return loanClosed flag                             │
│  ├─ Commit transaction                                       │
│  └─ Response: { payment, loanClosed }                        │
│                                                              │
│  Repeat Step 7 until outstandingAmount = 0                   │
└──────────────────────────────────────────┬───────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 8: LOAN CLOSED                                         │
│  Status: CLOSED                                              │
│  No more payments accepted                                   │
│  Borrower can now apply for new loan                         │
└──────────────────────────────────────────────────────────────┘
```

### 3. Database Schema Relationships

```
                        ┌──────────────┐
                        │    User      │
                        ├──────────────┤
                        │ _id (PK)     │
                        │ email (UQ)   │
                        │ password     │
                        │ role         │
                        │ userCode     │
                        │ panNumber    │
                        │ dateOfBirth  │
                        │ address      │
                        │ isActive     │
                        └────┬─────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    │ (1:N)           │ (1:N)
                    │ borrower        │ collectedBy
                    │                 │
                    ▼                 ▼
           ┌──────────────────┐  ┌──────────────────┐
           │      Loan        │  │    Payment       │
           ├──────────────────┤  ├──────────────────┤
           │ _id (PK)         │  │ _id (PK)         │
           │ borrower (FK)    │  │ loan (FK)        │
           │ status           │  │ borrower (FK)    │
           │ loanAmount       │  │ utrNumber (UQ)   │
           │ tenureDays       │  │ amount           │
           │ interestRate     │  │ paymentDate      │
           │ interestAmount   │  │ collectedBy (FK) │
           │ totalRepayment   │  │ createdAt        │
           │ paidAmount       │  └──────────────────┘
           │ outstanding      │
           │ salarySlip {}    │
           │ sanctionedBy (FK)│
           │ disbursedBy (FK) │
           │ createdAt        │
           └──────────────────┘

INDEXES:
- User: email (UNIQUE), role, userCode (UNIQUE)
- Loan: borrower+status, status
- Payment: utrNumber (UNIQUE), loan, borrower
```

### 4. Authentication & Authorization Flow

```
┌─────────────────────────────────────────┐
│  HTTP Request with Cookie               │
│  Cookie: lms_token=JWT...               │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  protect middleware │
        ├────────────────────┤
        │ Extract JWT token   │
        │ from cookies        │
        └────────────┬────────┘
                     │
              ┌──────┴──────┐
              │             │
            ✓ │             │ ✗
              │             │
              ▼             ▼
    ┌────────────────┐  ┌──────────────────┐
    │ Verify token   │  │ Return 401       │
    │ (JWT lib)      │  │ Unauthorized     │
    └────────┬───────┘  └──────────────────┘
             │
      ┌──────┴──────┐
      │             │
    ✓ │             │ ✗
      │             │
      ▼             ▼
┌──────────────┐  ┌──────────────────┐
│ Extract      │  │ Return 401       │
│ payload:     │  │ Token expired    │
│ - id         │  │ or invalid       │
│ - role       │  └──────────────────┘
│ - email      │
└────────┬─────┘
         │
         ▼
┌────────────────────────┐
│ Attach to req.user:    │
│ {                      │
│   id, role, email      │
│ }                      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Call next() to continue│
│ to authorize middleware│
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  authorize(ROLES.SANCTION)         │
├────────────────────────────────────┤
│ if user.role in allowedRoles       │
└────────┬───────────────────────────┘
         │
    ┌────┴────┐
    │          │
  ✓ │          │ ✗
    │          │
    ▼          ▼
┌───────┐  ┌──────────────────┐
│ Pass  │  │ Return 403       │
│       │  │ Forbidden        │
└───┬───┘  └──────────────────┘
    │
    ▼
┌────────────────────────────────────┐
│ Call controller handler            │
│ (Controller has access to user)    │
└────────────────────────────────────┘
```

### 5. Validation Pipeline

```
┌─────────────────────────────┐
│ HTTP Request                │
│ Body: JSON data             │
└────────────┬────────────────┘
             │
             ▼
┌───────────────────────────────────┐
│ validate(registerSchema) middleware│
├───────────────────────────────────┤
│ schema.parse(req.body)             │
│ (Zod validation)                   │
└────────────┬──────────────────────┘
             │
        ┌────┴────┐
        │          │
      ✓ │          │ ✗
        │          │
        ▼          ▼
    ┌────────┐  ┌──────────────────────┐
    │ Parse  │  │ Catch ZodError       │
    │ success│  ├──────────────────────┤
    │        │  │ Extract field errors │
    │        │  │ Return 422           │
    │        │  │ {                    │
    │        │  │   errors: [          │
    │        │  │     {                │
    │        │  │       field: "email",│
    │        │  │       message: "..."│
    │        │  │     }               │
    │        │  │   ]                 │
    │        │  │ }                    │
    └───┬────┘  └──────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Attach parsed data to         │
│ req.body                      │
│ (Type-transformed & validated)│
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Call next() → controller      │
│ (Safe to use req.body)        │
└───────────────────────────────┘
```

### 6. BRE (Business Rule Engine) Check

```
┌─────────────────────────────┐
│ Borrower Data               │
│ - DOB: 1995-05-15           │
│ - Salary: ₹50,000           │
│ - PAN: ABCDE0001F           │
│ - Employment: salaried      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Rule 1: Age Check           │
│ Calculate age:              │
│ 2024 - 1995 = ~29 years     │
│ 23 ≤ 29 ≤ 50? ✓             │
└────────────┬────────────────┘
             │ Continue
             ▼
┌─────────────────────────────┐
│ Rule 2: Salary Check        │
│ ₹50,000 ≥ ₹25,000? ✓         │
└────────────┬────────────────┘
             │ Continue
             ▼
┌─────────────────────────────┐
│ Rule 3: PAN Format Check    │
│ ABCDE0001F matches:         │
│ /^[A-Z]{5}[0-9]{4}[A-Z]{1}$ │
│ ✓ Valid                     │
└────────────┬────────────────┘
             │ Continue
             ▼
┌─────────────────────────────┐
│ Rule 4: Employment Check    │
│ Employment ≠ UNEMPLOYED? ✓  │
└────────────┬────────────────┘
             │
             ▼
        ┌────────────┐
        │ ALL RULES  │
        │ PASSED ✓   │
        └────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Return { passed: true }     │
│ Continue with app creation  │
└─────────────────────────────┘
```

### 7. Payment Recording & Loan Closure

```
┌──────────────────────────────┐
│ Payment Request              │
│ - UTR: XYZ123456             │
│ - Amount: ₹25,000            │
│ - Date: 2025-05-16           │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Start MongoDB Transaction    │
│ (Atomicity guarantee)        │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Fetch Loan (in transaction)  │
│ Validate:                    │
│ - Loan exists? ✓             │
│ - Status = DISBURSED? ✓      │
│ - Amount ≤ Outstanding? ✓    │
│ - UTR unique? ✓              │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Create Payment Document      │
│ {                            │
│   loan: ID                   │
│   borrower: ID               │
│   utrNumber: XYZ123456       │
│   amount: 25000              │
│   collectedBy: ID            │
│ }                            │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Update Loan Fields           │
│ paidAmount:                  │
│   0 + 25000 = 25000          │
│                              │
│ outstandingAmount:           │
│   102958.90 - 25000 = 77958.90
└────────────┬─────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Is loan paid off?  │
    │ (Outstanding ≤ 0) │
    └────────┬───────────┘
             │
         ┌───┴────┐
         │        │
       NO│        │YES
         │        │
         ▼        ▼
    ┌─────────┐ ┌──────────────────┐
    │ Keep    │ │ Close Loan       │
    │ status: │ │ ├─ status:       │
    │DISBURSED│ │ │   CLOSED       │
    │         │ │ ├─ closedAt:     │
    │         │ │ │   now()        │
    └────┬────┘ │ └──────┬─────────┘
         │      │        │
         │      └────┬───┘
         │           │
         └───────┬───┘
                 │
                 ▼
┌──────────────────────────────┐
│ Commit Transaction           │
│ (All-or-nothing)             │
│ Payment + Loan both updated  │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Return {                     │
│   payment: {...},            │
│   loanClosed: true/false     │
│ }                            │
└──────────────────────────────┘
```

---

## Important Constraints & Rules

### Loan Status Transitions
```
DRAFT     ──(Upload Slip)──→ APPLIED
APPLIED   ──(Sanction)───────→ SANCTIONED  or  REJECTED
SANCTIONED ─(Disburse)──→ DISBURSED
DISBURSED ──(Pay All)────→ CLOSED

Invalid transitions throw error 400
```

### Loan Validation Rules
```
Min Loan Amount: ₹50,000
Max Loan Amount: ₹5,00,000
Min Tenure: 30 days
Max Tenure: 365 days
Interest Rate: Fixed 12% p.a.
```

### BRE Rules (Cannot be bypassed)
```
Age: 23-50 years (both inclusive)
Salary: ≥ ₹25,000 per month
PAN: Must be valid format (AAAAA0000A)
Employment: Not unemployed
```

### Payment Rules
```
Amount: > 0 and ≤ outstanding balance
UTR: Must be unique across all payments
Loan Status: Must be DISBURSED
Payment Date: Can be historical
```

### File Upload Rules
```
Allowed Types: PDF, JPG, PNG
Max Size: 5MB
Storage: Cloudinary
Resource Type: "raw" for PDFs, "image" for photos
```

---

## Error Resolution Guide

| Error | HTTP | Cause | Resolution |
|-------|------|-------|-----------|
| "Authentication required" | 401 | Missing JWT | Login again |
| "Session expired" | 401 | Token expired | Re-login |
| "You do not have permission" | 403 | Wrong role | Use correct role |
| "Loan not found" | 404 | Invalid loan ID | Use correct ID |
| "Invalid email or password" | 401 | Wrong credentials | Verify login |
| "Email already exists" | 409 | Duplicate registration | Use different email |
| "Already have active loan" | 409 | Can't apply twice | Complete/reject first loan |
| "Salary slip required" | 400 | Upload missing | Upload salary slip |
| "Invalid loan amount" | 422 | Amount outside range | Use ₹50K-₹5L |
| "Payment exceeds balance" | 400 | Overpayment | Reduce amount |
| "UTR already exists" | 409 | Duplicate payment | Use unique UTR |
| "Validation failed" | 422 | Invalid input | Check field errors |
| "File too large" | 413 | > 5MB | Use smaller file |

---

## Useful Queries (MongoDB)

```javascript
// Find borrower's loans
db.loans.find({ borrower: ObjectId("...") })

// Find loans by status
db.loans.find({ status: "applied" }).limit(10)

// Find all payments for a loan
db.payments.find({ loan: ObjectId("...") })

// Calculate total collected
db.payments.aggregate([
  { $group: { _id: null, total: { $sum: "$amount" } } }
])

// Find overdue loans (disbursed but not closed after X days)
db.loans.find({
  status: "disbursed",
  disbursedAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})
```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (salt=12)
- ✅ JWT in httpOnly cookies
- ✅ CORS configured with credentials
- ✅ Role-based access control enforced
- ✅ Validation on all inputs
- ✅ Errors don't leak sensitive data
- ✅ File upload validated (type, size)
- ✅ MongoDB transactions for consistency
- ✅ Environment variables for secrets
- ⏳ Rate limiting (not implemented)
- ⏳ HTTPS enforcement (should use in production)
- ⏳ Input sanitization (Zod handles this)
- ⏳ SQL injection N/A (MongoDB)
- ⏳ CSRF protection (SameSite cookies)

---

## Performance Considerations

1. **Indexing**: Composite indexes on frequently filtered fields (borrower+status)
2. **Pagination**: Default 10 items, max 100
3. **Transactions**: Only for payment (atomic consistency)
4. **Queries**: Use .lean() for read-only data
5. **File Upload**: Stream to Cloudinary (not stored locally)
6. **Password Hashing**: Async bcrypt (salt=12 is slow by design)

---

## Future Enhancements

1. **Email Notifications**: Loan status updates, payment reminders
2. **SMS Alerts**: Critical notifications
3. **Loan Refinancing**: Allow new loan after current closed
4. **Interest Recalculation**: Based on prepayments
5. **Document Management**: KYC, income proof storage
6. **Analytics Dashboard**: Revenue, collection rate, defaults
7. **Webhook System**: External integrations
8. **Export Reports**: PDF, CSV formats
9. **Two-Factor Auth**: OTP verification
10. **Audit Logging**: Track all changes

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB replica set (for transactions)
- [ ] HTTPS enabled
- [ ] CORS origin updated
- [ ] Cloudinary credentials stored securely
- [ ] Logging setup (Winston/Morgan)
- [ ] Health check endpoint working
- [ ] Error monitoring (Sentry)
- [ ] Database backups scheduled
- [ ] Rate limiting configured
- [ ] API documentation deployed
- [ ] Load balancing setup (if needed)

