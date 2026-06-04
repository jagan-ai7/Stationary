import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addToCartAsync } from "@/features/cart/cartSlice";
import { getImageUrl } from "@/utils/imageHelper";
import { useEffect } from "react";
import { fetchProducts } from "@/features/products/productSlice";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const product = useAppSelector((s) => s.products.items.find((p) => p.id === productId));
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild className="mt-4">
          <Link to="/products">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl border bg-muted">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-sm uppercase tracking-wider text-muted-foreground">
          {product.category}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
        <div className="text-2xl font-semibold">${product.price}</div>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="text-sm">
          {product.stock === 0 ? (
            <span className="text-destructive">Out of stock</span>
          ) : product.stock < 10 ? (
            <span className="text-amber-600 dark:text-amber-400">Only {product.stock} left</span>
          ) : (
            <span className="text-muted-foreground">In stock</span>
          )}
        </div>
        <Button
          size="lg"
          disabled={product.stock === 0}
          onClick={() => {
            dispatch(addToCartAsync(product));
            toast.success(`${product.name} added to cart`);
          }}
          className="mt-4 w-fit"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
