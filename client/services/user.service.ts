import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/common.types";
import { User } from "@/types/auth.types";

// User API client: profile-related calls.
export const userService = {
  // Retrieve the authenticated user's profile.
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },
};