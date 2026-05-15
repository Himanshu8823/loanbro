import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { sendError } from "../utils/api-response";
import { MESSAGES } from "../constants/messages";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((e: ZodIssue) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        sendError(res, 422, MESSAGES.GENERAL.VALIDATION_ERROR, errors);
        return;
      }
      next(err);
    }
  };