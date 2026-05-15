import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentDocument extends Document {
  loan: mongoose.Types.ObjectId;
  borrower: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  collectedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PaymentSchema.index({ utrNumber: 1 }, { unique: true });
PaymentSchema.index({ loan: 1 });
PaymentSchema.index({ borrower: 1 });

const Payment: Model<IPaymentDocument> = mongoose.model<IPaymentDocument>(
  "Payment",
  PaymentSchema
);

export default Payment;