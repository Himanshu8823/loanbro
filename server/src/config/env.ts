import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: parseInt(process.env.PORT ?? "5000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",

  mongoUri: requireEnv("MONGO_URI"),

  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  cookieSecret: requireEnv("COOKIE_SECRET"),

  clientUrl: requireEnv("CLIENT_URL"),

  cloudinary: {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
    folder: process.env.CLOUDINARY_FOLDER ?? "lms/salary-slips",
  },

  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
} as const;