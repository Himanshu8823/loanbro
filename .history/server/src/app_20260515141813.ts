import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { sendError } from "./utils/api-response";
import { MESSAGES } from "./constants/messages";

const app: Application = express();

// ── CORS — credentials must be true for HTTP-only cookies to work ──
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Cookie parser ──
app.use(cookieParser(env.cookieSecret));

// ── Health check — always available, no auth ──
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes 
// app.use("/api/auth", authRoutes);
// app.use("/api/loans", loanRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/users", userRoutes);

// ── 404 handler — catches any unmatched route ──
app.use((req: Request, res: Response) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
});

// ── Global error handler 
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`, {
    stack: env.isDev ? err.stack : undefined,
  });

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0];
    return sendError(
      res,
      409,
      `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field"} already exists`
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    return sendError(res, 422, MESSAGES.GENERAL.VALIDATION_ERROR, errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, MESSAGES.AUTH.UNAUTHORIZED);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Session expired. Please log in again");
  }

  // Multer file size error
  if (err.message === "LIMIT_FILE_SIZE") {
    return sendError(res, 413, MESSAGES.UPLOAD.SIZE_EXCEEDED);
  }

  return sendError(
    res,
    500,
    env.isDev ? err.message : MESSAGES.GENERAL.SERVER_ERROR
  );
});

export default app;