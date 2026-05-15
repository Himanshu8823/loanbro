import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ROLES } from "../constants/roles";
import {
  createPayment,
  fetchPaymentsByLoan,
  fetchMyPayments,
} from "../controllers/payment.controller";
import { recordPaymentSchema } from "../validators/payment.validator";

const router = Router();

// Collection executive records a payment against a disbursed loan
router.post(
  "/:id/payments",
  protect,
  authorize(ROLES.COLLECTION, ROLES.ADMIN),
  validate(recordPaymentSchema),
  createPayment
);

// Fetch all payments for a specific loan — ops team and admin
router.get(
  "/:id/payments",
  protect,
  authorize(ROLES.COLLECTION, ROLES.DISBURSEMENT, ROLES.ADMIN),
  fetchPaymentsByLoan
);

// Borrower views their own payment history
router.get(
  "/my-payments",
  protect,
  authorize(ROLES.BORROWER),
  fetchMyPayments
);

export default router;