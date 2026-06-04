import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import productReducer from "@/features/products/productSlice";
import cartReducer from "@/features/cart/cartSlice";
import orderReducer from "@/features/orders/orderSlice";
import notificationReducer from "@/features/notifications/notificationSlice";
import themeReducer from "@/features/theme/themeSlice";
import usersReducer from "@/features/users/userSlice";
import chatReducer from "@/features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    notifications: notificationReducer,
    theme: themeReducer,
    users: usersReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
