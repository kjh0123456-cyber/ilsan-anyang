import { Suspense } from "react";
import { getProducts } from "@/lib/actions/products";
import { getUser, isAdmin } from "@/lib/actions/auth";
import ProductFilter from "@/components/products/product-filter";
import type { Category } from "@/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  vacuum: "로봇청소기",
  air: "공기청정기",
  speaker: "스마트스피커",
  light: "스마트조명",
  hub: "IoT 허브",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = params.category as Category | undefined;

  const [products, user] = await Promise.all([
    getProducts({
      category,
      sort: params.sort as "price_asc" | "price_desc" | "newest" | undefined,
      search: params.search,
    }),
    getUser(),
  ]);
  const admin = user ? await isAdmin(user.id) : false;

  const title = category && CATEGORY_LABELS[category] ? CATEGORY_LABELS[category] : "전체 상품";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl font-bold text-navy mb-8">{title}</h1>
      <Suspense fallback={null}>
        <ProductFilter products={products} isAdmin={admin} />
      </Suspense>
    </div>
  );
}
