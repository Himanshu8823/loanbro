export interface Payment {
  _id: string;
  loan: string;
  borrower: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  collectedBy: {
    _id: string;
    fullName: string;
    userCode: string;
  };
  createdAt: string;
}

export interface RecordPaymentPayload {
  utrNumber: string;
  amount: number;
  paymentDate: string;
}