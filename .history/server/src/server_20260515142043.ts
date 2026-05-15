import { connectDB } from "./config/db";
import { env } from "./config/env";
import app from "./app";

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first — server does not start if DB fails
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port} [${env.nodeEnv}]`);
      console.log(`📡 Health: http://localhost:${env.port}/health`);
    });

    // ── Graceful shutdown  ──
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log("🔌 HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // ── Unhandled promise rejections — log and exit ──
    process.on("unhandledRejection", (reason: unknown) => {
      console.error("❌ Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

    // ── Uncaught exceptions — log and exit ──
    process.on("uncaughtException", (err: Error) => {
      console.error("❌ Uncaught Exception:", err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();