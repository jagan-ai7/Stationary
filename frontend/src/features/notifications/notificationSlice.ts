import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import notificationService from "@/services/notificationService";

export type NotificationAudience = "user" | "admin";

export type NotificationKind =
  | "order_placed"
  | "order_shipped"
  | "order_delivered"
  | "offer"
  | "low_stock"
  | "out_of_stock"
  | "new_order";

export interface Notification {
  id: number;
  audience: NotificationAudience;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  loading: false,
  error: null,
};

const now = () => new Date().toISOString();
const createNotificationId = () => Date.now() + Math.floor(Math.random() * 1000);

// ✅ Thunks
export const fetchNotifications = createAsyncThunk<
  Notification[],
  NotificationAudience | undefined,
  { rejectValue: string }
>("notifications/fetch", async (audience, { rejectWithValue }) => {
  try {
    return await notificationService.getAll(audience);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const pushNotificationAsync = createAsyncThunk<
  Notification,
  Omit<Notification, "id" | "createdAt" | "read">,
  { rejectValue: string }
>("notifications/pushAsync", async (payload, { rejectWithValue }) => {
  try {
    return await notificationService.create(payload);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const markReadAsync = createAsyncThunk<number, number, { rejectValue: string }>(
  "notifications/markReadAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await notificationService.markRead(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const markAllReadAsync = createAsyncThunk<
  NotificationAudience,
  NotificationAudience,
  { rejectValue: string }
>("notifications/markAllReadAsync", async (audience, { rejectWithValue }) => {
  try {
    return await notificationService.markAllRead(audience);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // local push (optimistic)
    push(state, action: PayloadAction<Omit<Notification, "id" | "createdAt" | "read">>) {
      state.items.unshift({
        ...action.payload,
        id: createNotificationId(),
        createdAt: now(),
        read: false,
      });
    },

    markRead(state, action: PayloadAction<number>) {
      const n = state.items.find((x) => x.id === action.payload);
      if (n) n.read = true;
    },

    markAllRead(state, action: PayloadAction<NotificationAudience>) {
      state.items.forEach((n) => {
        if (n.audience === action.payload) n.read = true;
      });
    },
  },

  extraReducers: (b) => {
    b
      // 🔹 FETCH
      .addCase(fetchNotifications.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchNotifications.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch";
      })

      // 🔹 CREATE
      .addCase(pushNotificationAsync.fulfilled, (s, a) => {
        // prevent duplicates
        const exists = s.items.find((n) => n.id === a.payload.id);
        if (!exists) {
          s.items.unshift(a.payload);
        }
      })

      // 🔹 MARK ONE
      .addCase(markReadAsync.fulfilled, (s, a) => {
        const n = s.items.find((x) => x.id === a.payload);
        if (n) n.read = true;
      })

      // 🔹 MARK ALL
      .addCase(markAllReadAsync.fulfilled, (s, a) => {
        s.items.forEach((n) => {
          if (n.audience === a.payload) n.read = true;
        });
      });
  },
});

export const { push, markRead, markAllRead } = slice.actions;
export default slice.reducer;
