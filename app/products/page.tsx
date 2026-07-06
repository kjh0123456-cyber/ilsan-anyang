import { Suspense } from "react";
import { getProducts } from "@/lib/actions/products";
import ProductGrid from "@/components/products/product-grid";
import ProductFilter from "@/components/products/product-filter";
import type { Category } from "@/lib/types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}) {
  const params = await searchParams;

  const products = await getProducts({
    category: params.category as Category | undefined,
    sort: params.sort as "price_asc" | "price_desc" | "newest" | undefined,
    search: params.search,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy mb-6">전체 상품</h1>
      <Suspense fallback={null}>
        <ProductFilter />
      </Suspense>
      <ProductGrid products={products} />
    </div>
  );
}
