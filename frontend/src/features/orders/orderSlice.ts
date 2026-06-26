import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "@/services/orderService";

export interface Order {
  id: number;
  userId: number;
  userName?: string;
  date: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: { productId: number; name: string; qty: number; price: number }[];
}

export interface CreateOrderPayload {
  userId: number;
  userName: string;
  date: string;
  status: "pending";
  total: number;
  items: { productId: number; name: string; qty: number; price: number }[];
}

interface OrderState {
  items: Order[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: OrderState = {
  items: [],
  status: "idle",
};

export const fetchOrders = createAsyncThunk("orders/fetch/all", async () => {
  return await orderService.getAll();
});

export const fetchOrdersById = createAsyncThunk("orders/fetch", async () => {
  return await orderService.getById();
});

export const createOrder = createAsyncThunk<Order, CreateOrderPayload>(
  "orders/create",
  async (order) => {
    return await orderService.create(order);
  },
);

export const updateOrderStatusAsync = createAsyncThunk(
  "orders/updateStatusAsync",
  async ({ id, status }: { id: number; status: Order["status"] }) => {
    return await orderService.updateStatus(id, status);
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchOrdersById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrdersById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrdersById.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const order = state.items.find((o) => o.id === action.payload.id);
        if (order) {
          order.status = action.payload.status;
        }
      });
  },
});

export default orderSlice.reducer;
