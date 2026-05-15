import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { uploadSingleFile } from "../middlewares/upload.middleware";
import { ROLES } from "../constants/roles";
import {
  startApplication,
  uploadSlip,
  submitApplication,
  sanctionApplication,
  disburseApplication,
  getMyLoans,
  getLoans,
  getLoan,
  getLeads,
} from "../controllers/loan.controller";
import {
  startLoanSchema,
  applyLoanSchema,
} from "../validators/loan.validator";

const router = Router();

// Borrower routes
router.post(
  "/start",
  protect,
  authorize(ROLES.BORROWER),
  validate(startLoanSchema),
  startApplication
);

router.patch(
  "/:id/upload-slip",
  protect,
  authorize(ROLES.BORROWER),
  uploadSingleFile,
  uploadSlip
);

router.patch(
  "/:id/apply",
  protect,
  authorize(ROLES.BORROWER),
  validate(applyLoanSchema),
  submitApplication
);

router.get(
  "/my-loans",
  protect,
  authorize(ROLES.BORROWER),
  getMyLoans
);

// Operations routes
router.get(
  "/",
  protect,
  authorize(ROLES.ADMIN, ROLES.SALES, ROLES.SANCTION, ROLES.DISBURSEMENT, ROLES.COLLECTION),
  getLoans
);

router.get(
  "/leads",
  protect,
  authorize(ROLES.SALES, ROLES.ADMIN),
  getLeads
);

router.get(
  "/:id",
  protect,
  authorize(ROLES.ADMIN, ROLES.SANCTION, ROLES.DISBURSEMENT, ROLES.COLLECTION),
  getLoan
);

router.patch(
  "/:id/sanction",
  protect,
  authorize(ROLES.SANCTION, ROLES.ADMIN),
  sanctionApplication
);

router.patch(
  "/:id/disburse",
  protect,
  authorize(ROLES.DISBURSEMENT, ROLES.ADMIN),
  disburseApplication
);

export default router;