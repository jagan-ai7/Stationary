import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ProductCard from "@/components/user/ProductCard";
import { fetchProducts } from "@/features/products/productSlice";

export default function Home() {
  const products = useAppSelector((s) => s.products.items);
  const featured = useMemo(() => products.slice(0, 4), [products]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div>
      <section className="border-b bg-linear-to-b from-muted/40 to-background">
        <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Stationery for the
              <br /> thoughtfully written.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Notebooks, pens, and paper goods, made for people who still believe in writing things
              down.
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link to="/products">Shop the collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/products">Browse pens</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <img
              src="https://images.unsplash.com/photo-1499336315816-097655dcfbda?auto=format&fit=crop&w=1200&q=70"
              alt="Stationery flatlay"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
            <p className="text-sm text-muted-foreground">A few favorites from the shelf.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/products">View all →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">No products found.</p>
        )}
      </section>
    </div>
  );
}
