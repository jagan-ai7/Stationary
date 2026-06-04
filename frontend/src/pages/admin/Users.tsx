import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getUsers } from "@/features/users/userSlice";

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      {/* ✅ Loading State */}
      {loading && (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          Loading users...
        </div>
      )}

      {/* ✅ Error State */}
      {error && !loading && (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ✅ Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      )}

      {/* ✅ Table */}
      {!loading && !error && users.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
