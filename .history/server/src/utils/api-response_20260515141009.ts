import { Response } from "express";

interface ResponseOptions {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: unknown;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  options: ResponseOptions
): void => {
  res.status(statusCode).json({
    success: options.success,
    message: options.message,
    ...(options.data !== undefined && { data: options.data }),
    ...(options.errors !== undefined && { errors: options.errors }),
  });
};

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
): void => {
  sendResponse(res, statusCode, { success: true, message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void => {
  sendResponse(res, statusCode, { success: false, message, errors });
};