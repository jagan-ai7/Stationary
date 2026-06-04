import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUsers, updateUser } from "@/services/userService";
import type { AuthUser } from "@/features/auth/authSlice";

export interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  joined: string;
}

interface UserState {
  users: UserRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// ✅ Async thunk
export const getUsers = createAsyncThunk("users/getUsers", async (_, { rejectWithValue }) => {
  try {
    return await fetchUsers();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
  }
});

export const updateUserThunk = createAsyncThunk(
  "users/updateUser",
  async ({ data }: { data: Partial<AuthUser> }, { rejectWithValue }) => {
    try {
      return await updateUser(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  },
);
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedUser = action.payload;

        const index = state.users.findIndex((u) => u.id === updatedUser.id);

        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
          };
        }
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
