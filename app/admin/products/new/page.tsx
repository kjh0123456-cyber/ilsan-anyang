"use client";

import { useState } from "react";
import Link from "next/link";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORY_OPTIONS = [
  { value: "vacuum", label: "로봇청소기" },
  { value: "air", label: "공기청정기" },
  { value: "speaker", label: "스마트스피커" },
  { value: "light", label: "스마트조명" },
  { value: "hub", label: "IoT 허브" },
];

export default function NewProductPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createProduct(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-navy">상품 등록</h1>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-navy"
        >
          목록으로
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm max-w-xl">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="name">상품명</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">상품 설명</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full border rounded-lg p-2 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">가격 (원)</Label>
            <Input id="price" name="price" type="number" min={0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">재고</Label>
            <Input id="stock" name="stock" type="number" min={0} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="" disabled>
              선택해주세요
            </option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">이미지 URL (줄바꿈으로 구분)</Label>
          <textarea
            id="images"
            name="images"
            rows={3}
            placeholder="https://example.com/image1.jpg"
            className="w-full border rounded-lg p-2 text-sm resize-none"
          />
        </div>
        <Button type="submit" className="bg-navy hover:bg-navy-light text-white">
          등록하기
        </Button>
      </form>
    </div>
  );
}
