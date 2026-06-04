import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchProfile } from "@/features/auth/authSlice";

export default function AdminRoute() {
  const { token, user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (token && !user) dispatch(fetchProfile());
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (token && !user) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Verifying access…
      </div>
    );
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}