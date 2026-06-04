import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";
import PrivateRoute from "@/routes/PrivateRoute";
import AdminRoute from "@/routes/AdminRoute";
import PublicRoute from "@/routes/PublicRoute";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchProfile } from "@/features/auth/authSlice";

const Home = lazy(() => import("@/pages/user/Home"));
const Products = lazy(() => import("@/pages/user/Products"));
const ProductDetail = lazy(() => import("@/pages/user/ProductDetail"));
const Cart = lazy(() => import("@/pages/user/Cart"));
const Checkout = lazy(() => import("@/pages/user/Checkout"));
const Orders = lazy(() => import("@/pages/user/Orders"));
const Profile = lazy(() => import("@/pages/user/Profile"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminChat = lazy(() => import("@/pages/admin/Chat"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ChatPage = lazy(() => import("@/pages/user/chat"));

function Fallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
  );
}

export default function App() {
  const theme = useAppSelector((s) => s.theme.mode);
  const { token, user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  // ✅ FIXED
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // ✅ Fetch profile once
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [token, user, dispatch]);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* USER */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>

        {/* AUTH */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
