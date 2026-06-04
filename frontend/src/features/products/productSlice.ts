import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import productService from "@/services/productService";

export interface Product {
  id: number; // ⚠️ important (your remove uses number)
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

interface ProductState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>("products/fetch", async () => {
  return await productService.getAll();
});

export const createProduct = createAsyncThunk<
  Product,
  { product: Omit<Product, "id">; file?: File }
>("products/create", async ({ product, file }) => {
  return await productService.create(product, file);
});

export const editProduct = createAsyncThunk<Product, { product: Product; file?: File }>(
  "products/edit",
  async ({ product, file }) => {
    return await productService.update(product, file);
  },
);

export const removeProduct = createAsyncThunk<number, number>(
  "products/remove",
  async (id) => await productService.remove(id),
);

const slice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => {
      s.status = "loading";
    });
    b.addCase(fetchProducts.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.items = a.payload;
    });
    b.addCase(fetchProducts.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message ?? "Failed";
    });
    b.addCase(createProduct.fulfilled, (s, a) => {
      s.items.unshift(a.payload);
    });
    b.addCase(editProduct.fulfilled, (s, a) => {
      const idx = s.items.findIndex((p) => p.id === a.payload.id);
      if (idx !== -1) s.items[idx] = a.payload;
    });
    b.addCase(removeProduct.fulfilled, (s, a) => {
      s.items = s.items.filter((p) => p.id !== a.payload);
    });
  },
});

export const { addProduct, updateProduct, deleteProduct } = slice.actions;
export default slice.reducer;
