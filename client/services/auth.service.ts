import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/common.types";
import { SignupFormValues, LoginFormValues } from "@/schemas/auth.schema";
import { AuthResponse } from "@/types/auth.types";

// Auth API client: signup, login, logout, and profile retrieval.
export const authService = {
  // Register a new user account. Returns auth payload on success.
  signup: async (data: SignupFormValues): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
  },

  // Authenticate a user and receive auth token/cookie.
  login: async (data: LoginFormValues): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  // Invalidate the current session on the server.
  logout: async (): Promise<ApiResponse> => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },

  // Retrieve the authenticated user's profile.
  getMe: async (): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },
};