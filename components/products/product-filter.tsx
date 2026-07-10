"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductGrid from "./product-grid";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "vacuum", label: "로봇청소기" },
  { value: "air", label: "공기청정기" },
  { value: "speaker", label: "스마트스피커" },
  { value: "light", label: "스마트조명" },
  { value: "hub", label: "IoT 허브" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

interface FilterState {
  category: string;
  sort: string;
}

export default function ProductFilter({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlState: FilterState = {
    category: searchParams.get("category") ?? "",
    sort: searchParams.get("sort") ?? "newest",
  };

  const [isPending, startTransition] = useTransition();
  // Reflects the just-clicked button immediately, before the navigation
  // that actually re-fetches the filtered list has finished — otherwise the
  // selected pill only visually updates once the new page data arrives,
  // which reads as an unresponsive click.
  const [optimistic, setOptimistic] = useOptimistic(
    urlState,
    (state, partial: Partial<FilterState>) => ({ ...state, ...partial })
  );

  function setParam(key: keyof FilterState, value: string) {
    startTransition(() => {
      setOptimistic({ [key]: value });
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <>
      {/* lg+ already has the category picker in the header nav; this row is
          the only category picker mobile/tablet users have while on this page. */}
      <div className="flex flex-wrap gap-1 mb-2 lg:hidden">
        {CATEGORIES.map((cat) => {
          const selected = optimistic.category === cat.value;
          return (
            <Button
              key={cat.value}
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => setParam("category", cat.value)}
              className={cn(
                "transition-colors duration-200",
                selected
                  ? "bg-gold hover:bg-gold-light text-white"
                  : "hover:border-gold hover:text-gold"
              )}
            >
              {cat.label}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 ml-auto">
          {SORT_OPTIONS.map((opt) => {
            const selected = optimistic.sort === opt.value;
            return (
              <Button
                key={opt.value}
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => setParam("sort", opt.value)}
                className={cn(
                  "transition-colors duration-200",
                  selected
                    ? "bg-gold hover:bg-gold-light text-white"
                    : "hover:border-gold hover:text-gold"
                )}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div
        className={cn(
          "transition-opacity duration-200",
          isPending && "opacity-40 pointer-events-none"
        )}
      >
        <ProductGrid products={products} />
      </div>
    </>
  );
}
