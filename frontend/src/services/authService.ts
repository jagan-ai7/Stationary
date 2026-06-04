import api from "@/api/axios";
import type { AuthUser } from "@/features/auth/authSlice";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends Omit<AuthUser, "id" | "role"> {
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface FetchProfileResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", payload);
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>("/auth/signup", payload);
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Signup failed");
    }
  },

  async fetchProfile(): Promise<AuthUser> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");
    try {
      const { data } = await api.get<FetchProfileResponse>("/auth/me");
      return data.user;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Fetch profile failed");
    }
  },
};

export default authService;
