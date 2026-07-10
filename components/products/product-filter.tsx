"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductGrid from "./product-grid";
import type { Product } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

export default function ProductFilter({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSort = searchParams.get("sort") ?? "newest";

  const [isPending, startTransition] = useTransition();
  // Reflects the just-clicked button immediately, before the navigation
  // that actually re-fetches the filtered list has finished — otherwise the
  // selected pill only visually updates once the new page data arrives,
  // which reads as an unresponsive click.
  const [optimisticSort, setOptimisticSort] = useOptimistic(
    urlSort,
    (_state, next: string) => next
  );

  function setSort(value: string) {
    startTransition(() => {
      setOptimisticSort(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("sort", value);
      else params.delete("sort");
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 ml-auto">
          {SORT_OPTIONS.map((opt) => {
            const selected = optimisticSort === opt.value;
            return (
              <Button
                key={opt.value}
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => setSort(opt.value)}
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
