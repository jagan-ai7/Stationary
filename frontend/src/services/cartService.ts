import api from "@/api/axios";
import { type Product } from "@/features/products/productSlice";

export interface CartItemDTO {
  product: Product;
  qty: number;
}

export const cartService = {
  async get(): Promise<CartItemDTO[]> {
    const { data } = await api.get<CartItemDTO[]>("/cart");
    return data;
  },

  async add(product: Product, qty = 1): Promise<CartItemDTO> {
    const { data } = await api.post<CartItemDTO>("/cart", {
      productId: product.id,
      qty,
    });
    return data;
  },

  async update(productId: number, qty: number): Promise<{ productId: number; qty: number }> {
    const { data } = await api.patch<{ productId: number; qty: number }>(`/cart/${productId}`, {
      qty,
    });
    return data;
  },

  async remove(productId: number): Promise<number> {
    await api.delete(`/cart/${productId}`);
    return productId;
  },

  async clear(): Promise<void> {
    await api.delete("/cart");
  },
};

export default cartService;
