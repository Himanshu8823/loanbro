import { Types } from "mongoose";

export interface IPayment {
  _id: Types.ObjectId;
  loan: Types.ObjectId;
  borrower: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  collectedBy: Types.ObjectId;
  createdAt: Date;
}