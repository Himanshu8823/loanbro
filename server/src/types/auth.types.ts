import { Role } from "../constants/roles";

export interface JwtPayload {
  id: string;
  role: Role;
  email: string;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginBody {
  email: string;
  password: string;
}