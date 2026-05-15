import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/token.service";
import { sendError } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";
import { COOKIE_NAME } from "../config/cookie";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      sendError(res, 401, MESSAGES.AUTH.UNAUTHORIZED);
      return;
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    next(err);
  }
};