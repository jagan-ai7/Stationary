import { useEffect, useMemo } from "react";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchProducts } from "@/features/products/productSlice";
import { fetchOrders } from "@/features/orders/orderSlice";
import { getUsers } from "@/features/users/userSlice";

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const products = useAppSelector((s) => s.products.items);
  const orders = useAppSelector((s) => s.orders.items);
  const users = useAppSelector((s) => s.users.users);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(getUsers());
  }, [dispatch]);

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "delivered") // ✅ only valid revenue
        .reduce((s, o) => s + (o.total || 0), 0),
    [orders],
  );
  const lowStock = useMemo(() => products.filter((p) => p.stock > 0 && p.stock < 10), [products]);
  const outOfStock = useMemo(() => products.filter((p) => p.stock === 0), [products]);
  const customers = useMemo(() => users.filter((u) => u.role === "user"), [users]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={`$${revenue.toFixed(0)}`} Icon={DollarSign} />
        <Stat label="Orders" value={String(orders.length)} Icon={ShoppingBag} />
        <Stat label="Products" value={String(products.length)} Icon={Package} />
        <Stat label="Customers" value={String(customers.length)} Icon={Users} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">#{o.id}</div>
                  <div className="text-muted-foreground">{o.userName}</div>
                </div>
                <div className="text-muted-foreground">{o.status}</div>
                <div className="font-medium">${o.total}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Stock alerts</h2>
          {outOfStock.length === 0 && lowStock.length === 0 && (
            <p className="text-sm text-muted-foreground">All stocked up.</p>
          )}
          {outOfStock.map((p) => (
            <div key={p.id} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
              <span className="text-destructive">Out of stock</span>
            </div>
          ))}
          {lowStock.map((p) => (
            <div key={p.id} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
              <span className="text-amber-600 dark:text-amber-400">{p.stock} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
