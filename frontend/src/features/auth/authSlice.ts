import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import authService from "@/services/authService";
import { toast } from "sonner";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  role: "user" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;

  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  signupStatus: "idle" | "loading" | "succeeded" | "failed";
  profileStatus: "idle" | "loading" | "succeeded" | "failed";

  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  loginStatus: "idle",
  signupStatus: "idle",
  profileStatus: "idle",
  error: null,
};

export const login = createAsyncThunk<
  { token: string; user: AuthUser },
  { email: string; password: string }
>("auth/login", async (payload) => {
  const res = await authService.login(payload);
  localStorage.setItem("token", res.token);
  return res;
});

export const signup = createAsyncThunk<
  { token: string; user: AuthUser },
  Omit<AuthUser, "id" | "role"> & { password: string }
>("auth/signup", async (form) => {
  const res = await authService.signup(form);
  localStorage.setItem("token", res.token);
  return res;
});

export const fetchProfile = createAsyncThunk<AuthUser, void>("auth/fetchProfile", async (_) => {
  return await authService.fetchProfile();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loginStatus = "idle";
      state.signupStatus = "idle";
      state.profileStatus = "idle";
      state.error = null;
      localStorage.removeItem("token");
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.loginStatus = "loading";
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.loginStatus = "succeeded";
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(login.rejected, (s, a) => {
      s.loginStatus = "failed";
      s.error = a.error.message || "Login failed";

      toast.error(s.error);
    });
    b.addCase(signup.pending, (s) => {
      s.signupStatus = "loading";
      s.error = null;
    });
    b.addCase(signup.fulfilled, (s, a) => {
      s.signupStatus = "succeeded";
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(signup.rejected, (s, a) => {
      s.signupStatus = "failed";
      s.error = a.error.message || "Signup failed";

      toast.error(s.error);
    });
    b.addCase(fetchProfile.pending, (s) => {
      s.profileStatus = "loading";
    });
    b.addCase(fetchProfile.fulfilled, (s, a) => {
      s.user = a.payload;
      s.profileStatus = "succeeded";
      s.error = null;
    });
    b.addCase(fetchProfile.rejected, (s) => {
      s.user = null;
      s.token = null;
      s.profileStatus = "failed";
    });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
