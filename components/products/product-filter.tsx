"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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

export default function ProductFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={currentCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setParam("category", cat.value)}
            className={currentCategory === cat.value ? "bg-gold text-white" : ""}
          >
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-1 ml-auto">
        {SORT_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={currentSort === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setParam("sort", opt.value)}
            className={currentSort === opt.value ? "bg-gold text-white" : ""}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
