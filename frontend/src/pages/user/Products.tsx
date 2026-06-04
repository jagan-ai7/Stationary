import { useMemo, useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ProductCard from "@/components/user/ProductCard";
import { fetchProducts } from "@/features/products/productSlice";

export default function Products() {
  const products = useAppSelector((s) => s.products.items);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCat = category === "All" || p.category === category;
      return matchesQuery && matchesCat;
    });
  }, [products, query, category]);

  const onCategory = useCallback((c: string) => setCategory(c), []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
        </div>
        <Input
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:w-72"
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => onCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">No products match your search.</p>
      )}
    </div>
  );
}
