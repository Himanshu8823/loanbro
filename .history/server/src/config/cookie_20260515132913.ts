import { CookieOptions } from "express";
import { env } from "./env";

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,    
  secure: env.isProd,
  sameSite: "strict",
  path: "/",
};

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 0,
};

export const COOKIE_NAME = "lms_token";