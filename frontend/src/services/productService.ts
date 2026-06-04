import api from "@/api/axios";
import { type Product } from "@/features/products/productSlice";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const { data } = await api.get<ApiResponse<Product[]>>("/products");
      return data.data;
    } catch (err: any) {
      console.log("Fetch products error:", err.response?.data?.message || err.message);
      return [];
    }
  },

  async create(product: Omit<Product, "id">, file?: File): Promise<Product> {
    try {
      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("price", String(product.price));
      formData.append("stock", String(product.stock));
      formData.append("description", product.description || "");

      if (file) {
        formData.append("productImage", file); // ⚠️ must match multer
      }

      const { data } = await api.post<ApiResponse<Product>>("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.data;
    } catch (err: any) {
      console.log("Create product error:", err.response?.data?.message || err.message);
      throw err;
    }
  },

  async update(product: Product, file?: File): Promise<Product> {
    try {
      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("price", String(product.price));
      formData.append("stock", String(product.stock));
      formData.append("description", product.description || "");

      if (file) {
        formData.append("productImage", file);
      }

      const { data } = await api.put<ApiResponse<Product>>(`/products/${product.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.data;
    } catch (err: any) {
      console.log("Update product error:", err.response?.data?.message || err.message);
      throw err;
    }
  },

  async remove(id: number): Promise<number> {
    try {
      await api.delete(`/products/${id}`);
    } catch {
      /* ignore */
    }
    return id;
  },
};

export default productService;
