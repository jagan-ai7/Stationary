import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Product } from "@/features/products/productSlice";
import cartService from "@/services/cartService";
import { useAppSelector } from "@/app/hooks";

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

// ✅ Async thunks
export const fetchCart = createAsyncThunk("cart/fetch", async (_, { getState }) => {
  const state = getState() as any; // or RootState if typed
  const token = state.auth.token;

  // 🚫 Prevent API call if not logged in
  if (!token) {
    return [];
  }
  const res = await cartService.get();
  return res;
});

export const addToCartAsync = createAsyncThunk("cart/addAsync", async (product: Product) => {
  return await cartService.add(product, 1);
});

export const updateQtyAsync = createAsyncThunk(
  "cart/updateAsync",
  async (payload: { id: number; qty: number }) => {
    return await cartService.update(payload.id, payload.qty);
  },
);

export const removeFromCartAsync = createAsyncThunk("cart/removeAsync", async (id: number) => {
  return await cartService.remove(id);
});

export const clearCartAsync = createAsyncThunk("cart/clearAsync", async () => {
  await cartService.clear();
});

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optional local reducers (can keep or remove)
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find((i) => i.product.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ product: action.payload, qty: 1 });
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
    },
    updateQty(state, action: PayloadAction<{ id: number; qty: number }>) {
      const item = state.items.find((i) => i.product.id === action.payload.id);
      if (item) item.qty = Math.max(1, action.payload.qty);
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCart.fulfilled, (s, a) => {
      s.items = a.payload;
    });

    b.addCase(addToCartAsync.fulfilled, (s, a) => {
      const existing = s.items.find((i) => i.product.id === a.payload.product.id);

      if (existing) {
        // ✅ FIX: use backend qty
        existing.qty = a.payload.qty;
      } else {
        s.items.push(a.payload);
      }
    });

    b.addCase(updateQtyAsync.fulfilled, (s, a) => {
      const item = s.items.find((i) => i.product.id === a.payload.productId);
      if (item) {
        item.qty = Math.max(1, a.payload.qty);
      }
    });

    b.addCase(removeFromCartAsync.fulfilled, (s, a) => {
      s.items = s.items.filter((i) => i.product.id !== a.payload);
    });

    b.addCase(clearCartAsync.fulfilled, (s) => {
      s.items = [];
    });
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = slice.actions;
export default slice.reducer;
