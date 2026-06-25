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

// ✅ Thunks
export const fetchNotifications = createAsyncThunk<
  Notification[],
  NotificationAudience | undefined
>("notifications/fetch", async (audience) => {
  return await notificationService.getAll(audience);
});

export const pushNotificationAsync = createAsyncThunk<
  Notification,
  Omit<Notification, "id" | "createdAt" | "read">
>("notifications/pushAsync", async (payload) => {
  return await notificationService.create(payload);
});

export const markReadAsync = createAsyncThunk<number, number>(
  "notifications/markReadAsync",
  async (id) => {
    return await notificationService.markRead(id);
  },
);

export const markAllReadAsync = createAsyncThunk<NotificationAudience, NotificationAudience>(
  "notifications/markAllReadAsync",
  async (audience) => {
    return await notificationService.markAllRead(audience);
  },
);

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
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
        s.error = a.error.message || "Failed to fetch";
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

export const { markRead, markAllRead } = slice.actions;
export default slice.reducer;
