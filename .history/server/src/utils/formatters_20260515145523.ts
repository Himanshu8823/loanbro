import { IUser } from "../models/user.model";

export const roundToTwo = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatUserResponse = (user: IUser) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  userCode: user.userCode,
  phoneNumber: user.phoneNumber,
  isActive: user.isActive,
});