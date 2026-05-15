"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthContext } from "@/context/auth-context";
import { ROLE_REDIRECT } from "@/lib/constants";
import { SignupFormValues, LoginFormValues } from "@/schemas/auth.schema";

const QUERY_KEYS = {
  me: ["auth", "me"],
};

/** Fetches current user on mount — populates auth context. */
export const useMe = () => {
  const { setUser } = useAuthContext();

  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => {
      const res = await authService.getMe();
      setUser(res.data?.user ?? null);
      return res.data?.user ?? null;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSignup = (onSuccess?: () => void) => {
  const router = useRouter();
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (data: SignupFormValues) => authService.signup(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      if (user) {
        setUser(user);
        toast.success(res.message ?? "Account created successfully");
        onSuccess?.();
        router.push(ROLE_REDIRECT[user.role] ?? "/login");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Signup failed");
    },
  });
};

export const useLogin = (onSuccess?: () => void) => {
  const router = useRouter();
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (data: LoginFormValues) => authService.login(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      if (user) {
        setUser(user);
        toast.success(res.message ?? "Logged in successfully");
        onSuccess?.();
        router.push(ROLE_REDIRECT[user.role] ?? "/login");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Login failed");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      // Force logout on client even if server call fails
      logout();
      queryClient.clear();
      router.push("/login");
    },
  });
};