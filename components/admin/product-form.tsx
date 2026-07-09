"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

const CATEGORY_OPTIONS = [
  { value: "vacuum", label: "로봇청소기" },
  { value: "air", label: "공기청정기" },
  { value: "speaker", label: "스마트스피커" },
  { value: "light", label: "스마트조명" },
  { value: "hub", label: "IoT 허브" },
];

interface ProductFormProps {
  product?: Product;
  submitLabel: string;
}

export default function ProductForm({ product, submitLabel }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? []
  );

  async function handleSubmit(formData: FormData) {
    formData.set("existingImages", JSON.stringify(existingImages));
    setSubmitting(true);
    setError(null);
    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm max-w-xl">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="name">상품명</Label>
          <Input id="name" name="name" required defaultValue={product?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">상품 설명</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description}
            className="w-full border rounded-lg p-2 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">가격 (원)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={product?.price}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">재고</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={product?.stock}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue={product?.category ?? ""}
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

        {product && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-normal">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product.is_active}
                className="h-4 w-4"
              />
              판매중 (체크 해제 시 목록/상세에서 숨김)
            </Label>
          </div>
        )}

        <div className="space-y-2">
          <Label>상품 이미지</Label>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border"
                >
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    aria-label="이미지 삭제"
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="w-full border rounded-lg p-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP, GIF (최대 5MB)
          </p>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-navy hover:bg-navy-light text-white"
        >
          {submitting ? "처리 중..." : submitLabel}
        </Button>
      </form>
    </>
  );
}
