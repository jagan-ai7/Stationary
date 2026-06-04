import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import { fetchCart, removeFromCartAsync, updateQtyAsync } from "@/features/cart/cartSlice";
import { getImageUrl } from "@/utils/imageHelper";

export default function Cart() {
  const items = useAppSelector((s) => s.cart.items);
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  // ✅ Fetch cart on load
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.qty, 0), [items]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Start with something beautiful.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>

        {items.map(({ product, qty }) => (
          <div key={product.id} className="flex gap-4 rounded-xl border bg-card p-4">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="h-24 w-24 rounded-lg object-cover"
            />

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">${product.price}</div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(removeFromCartAsync(product.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-auto flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => dispatch(updateQtyAsync({ id: product.id, qty: qty - 1 }))}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="w-8 text-center">{qty}</span>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => dispatch(updateQtyAsync({ id: product.id, qty: qty + 1 }))}
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <div className="ml-auto font-medium">${(product.price * qty).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Summary</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button className="w-full" onClick={() => nav(token ? "/checkout" : "/login")}>
          {token ? "Checkout" : "Sign in to checkout"}
        </Button>
      </aside>
    </div>
  );
}
