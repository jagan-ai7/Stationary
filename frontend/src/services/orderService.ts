import api from "@/api/axios";
import { type Order, CreateOrderPayload } from "@/features/orders/orderSlice";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders/all");

    return data.data; // ✅ FIXED
  },

  async getById(): Promise<Order[]> {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders");

    return data.data; // ✅ FIXED
  },

  async create(order: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>("/orders", order);

    return data.data; // ✅ FIXED
  },

  async updateStatus(
    id: number,
    status: Order["status"],
  ): Promise<{ id: number; status: Order["status"] }> {
    const { data } = await api.patch<ApiResponse<any>>(`/orders/${id}/status`, { status });

    return {
      id,
      status: data.data?.status || status, // ✅ safe fallback
    };
  },
};

export default orderService;
