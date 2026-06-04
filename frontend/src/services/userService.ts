import axios from "@/api/axios";
import type { UserRecord } from "@/features/users/userSlice";
import type { AuthUser } from "@/features/auth/authSlice";

interface ApiResponse {
  status: string;
  message: string;
  data: any[];
}

interface ApiSingleUserResponse {
  status: string;
  message: string;
  data: AuthUser;
}

export const fetchUsers = async (): Promise<UserRecord[]> => {
  const res = await axios.get<ApiResponse>("/users");

  return res.data.data.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    joined: user.joined, // ✅ already formatted from backend
  }));
};

export const updateUser = async (payload: Partial<AuthUser>): Promise<AuthUser> => {
  const res = await axios.put<ApiSingleUserResponse>(`/users/edit`, payload);
  return res.data.data;
};
