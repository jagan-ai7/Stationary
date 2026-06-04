import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addToCartAsync } from "@/features/cart/cartSlice";
import { type Product } from "@/features/products/productSlice";
import { getImageUrl } from "@/utils/imageHelper";

function ProductCard({ product }: { product: Product }) {
  const { token } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const oos = product.stock === 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="aspect-square overflow-hidden bg-muted">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </div>
        <Link to={`/products/${product.id}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">${product.price}</span>
          <Button
            size="sm"
            disabled={oos}
            onClick={() => {
              if (token) {
                dispatch(addToCartAsync(product));
                toast.success(`${product.name} added to cart`);
              } else {
                toast.error("Log in to add items to cart");
              }
            }}
          >
            {oos ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
