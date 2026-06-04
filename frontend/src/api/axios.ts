import axios from "axios";
import { toast } from "sonner";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3030/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      // ❌ don't toast this
      return Promise.reject(error);
    }

    const msg = error?.response?.data?.message || error?.message || "Something went wrong";

    const silent = error?.response?.data?.silent; // 👈 NEW

    if (status === 500) {
      toast.error("Server error. Please try again later."); // ✅ generic
    } else if (status >= 400) {
      toast.error(msg); // ✅ safe for user errors
    }

    return Promise.reject(error);
  },
);

export default api;
