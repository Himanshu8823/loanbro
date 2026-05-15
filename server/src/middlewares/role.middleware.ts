import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles";
import { sendError } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, MESSAGES.AUTH.UNAUTHORIZED);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, MESSAGES.AUTH.FORBIDDEN);
      return;
    }

    next();
  };