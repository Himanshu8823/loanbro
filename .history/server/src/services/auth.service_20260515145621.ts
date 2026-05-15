import User, { IUser } from "../models/user.model";
import { RegisterBody } from "../types/auth.types";
import { ROLES } from "../constants/roles";
import { MESSAGES } from "../constants/messages";
import { generateUserCode } from "../utils/generate-user-code";
import { AppError } from "../utils/app-error";

const checkEmailExists = async (email: string): Promise<void> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, 409);
  }
};

const generateNextUserCode = async (): Promise<string> => {
  const count = await User.countDocuments({ role: ROLES.BORROWER });
  return generateUserCode(ROLES.BORROWER, count + 1);
};

const verifyCredentials = async (
  email: string,
  password: string
): Promise<IUser> => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  return user;
};

const verifyAccountActive = (user: IUser): void => {
  if (!user.isActive) {
    throw new AppError(MESSAGES.AUTH.ACCOUNT_INACTIVE, 403);
  }
};

export const registerUser = async (body: RegisterBody): Promise<IUser> => {
  const { fullName, email, password, phoneNumber } = body;

  await checkEmailExists(email.toLowerCase().trim());

  const userCode = await generateNextUserCode();

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,
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
  const user = await verifyCredentials(email.toLowerCase().trim(), password);
  verifyAccountActive(user);
  return user;
};