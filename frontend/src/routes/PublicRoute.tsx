import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function PublicRoute() {
  const { token } = useAppSelector((s) => s.auth);
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}