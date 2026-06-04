import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function PrivateRoute() {
  const { token, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (token && !user) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Restoring account…
      </div>
    );
  }

  return <Outlet />;
}
