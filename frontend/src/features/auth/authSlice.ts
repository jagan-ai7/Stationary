import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import authService from "@/services/authService";

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
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  { token: string; user: AuthUser },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.login(payload);
    localStorage.setItem("token", res.token);
    return res;
  } catch {
    return rejectWithValue("Login failed");
  }
});

export const signup = createAsyncThunk<
  { token: string; user: AuthUser },
  Omit<AuthUser, "id" | "role"> & { password: string },
  { rejectValue: string }
>("auth/signup", async (form, { rejectWithValue }) => {
  try {
    const res = await authService.signup(form);
    localStorage.setItem("token", res.token);
    return res;
  } catch {
    return rejectWithValue("Signup failed");
  }
});

export const fetchProfile = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchProfile();
    } catch {
      return rejectWithValue("Invalid token");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(login.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? "Login failed";
    });
    b.addCase(signup.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(signup.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(signup.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? "Signup failed";
    });
    b.addCase(fetchProfile.fulfilled, (s, a) => {
      s.user = a.payload;
    });
    b.addCase(fetchProfile.rejected, (s) => {
      s.user = null;
      s.token = null;
    });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
