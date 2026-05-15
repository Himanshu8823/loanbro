import { ROLES } from "@/lib/constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  userCode: string;
  phoneNumber: string;
  isActive: boolean;
  panNumber?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface AuthResponse {
  user: User;
}