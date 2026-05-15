import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { signToken } from "../services/token.service";
import { sendSuccess, sendError } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";
import {
  AUTH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  COOKIE_NAME,
} from "../config/cookie";
import asyncHandler from "../utils/async-handler";
import { formatUserResponse } from "../utils/formatters";
import User from "../models/user.model";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);

  const token = signToken({
    id: String(user._id),
    role: user.role,
    email: user.email,
  });

  res.cookie(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  sendSuccess(res, 201, MESSAGES.AUTH.REGISTER_SUCCESS, {
    user: formatUserResponse(user),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const token = signToken({
    id: String(user._id),
    role: user.role,
    email: user.email,
  });

  res.cookie(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  sendSuccess(res, 200, MESSAGES.AUTH.LOGIN_SUCCESS, {
    user: formatUserResponse(user),
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie(COOKIE_NAME, "", CLEAR_COOKIE_OPTIONS);
  sendSuccess(res, 200, MESSAGES.AUTH.LOGOUT_SUCCESS);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).select("-password -__v");

  if (!user) {
    sendError(res, 404, MESSAGES.AUTH.USER_NOT_FOUND);
    return;
  }

  sendSuccess(res, 200, MESSAGES.AUTH.ME_SUCCESS, {
    user: formatUserResponse(user),
  });
});