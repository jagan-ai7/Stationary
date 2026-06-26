import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { fetchOrdersById } from "@/features/orders/orderSlice";

export default function Orders() {
  const user = useAppSelector((s) => s.auth.user);
  const allOrders = useAppSelector((s) => s.orders.items);
  const orders = useMemo(() => {
    if (!Array.isArray(allOrders)) return [];

    return allOrders.filter((o) => {
      if (!user) return true;

      const userName = o.userName || "";
      const firstName = user.firstName || "";

      return o.userId === user.id || userName.toLowerCase().includes(firstName.toLowerCase());
    });
  }, [allOrders, user]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOrdersById());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">Order #{o.id}</div>
                  <div className="text-sm text-muted-foreground">{o.date}</div>
                </div>
                <Badge variant={o.status === "delivered" ? "default" : "secondary"}>
                  {o.status}
                </Badge>
                <div className="text-lg font-semibold">${o.total.toFixed(2)}</div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {o.items.map((it) => (
                  <li key={it.productId}>
                    {it.qty} × {it.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
