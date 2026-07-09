"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function formatPriceInput(digitsOnly: string): string {
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("ko-KR");
}

interface ProductFormProps {
  product?: Product;
  submitLabel: string;
}

export default function ProductForm({ product, submitLabel }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? []
  );
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [priceDisplay, setPriceDisplay] = useState(
    product?.price != null ? product.price.toLocaleString("ko-KR") : ""
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const pendingLabel = product ? "수정 중..." : "등록 중...";
  const successMessage = product
    ? "상품이 수정되었습니다."
    : "상품이 등록되었습니다.";
  const busy = isPending || success;

  function handleSubmit(formData: FormData) {
    if (busy) return;
    formData.set("existingImages", JSON.stringify(existingImages));
    formData.set("price", priceDisplay.replace(/,/g, ""));
    setError(null);
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 700);
    });
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setPriceDisplay(formatPriceInput(digitsOnly));
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm max-w-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 text-green-700 text-sm max-w-xl">
          {successMessage}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="category">
            카테고리
            <RequiredMark />
          </Label>
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

        <div className="space-y-2">
          <Label htmlFor="name">
            상품명
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required defaultValue={product?.name} />
        </div>

        <div className="space-y-2">
          <Label>상품 이미지</Label>
          {(existingImages.length > 0 || newImagePreviews.length > 0) && (
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
              {newImagePreviews.map((url, i) => (
                <div
                  key={url}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gold"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`새 이미지 ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-gold/90 text-white text-[10px] text-center">
                    NEW
                  </span>
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
            onChange={handleImagesChange}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP, GIF (최대 5MB)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">
              가격 (원)
              <RequiredMark />
            </Label>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              required
              value={priceDisplay}
              onChange={handlePriceChange}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">
              재고
              <RequiredMark />
            </Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={product?.stock ?? 0}
            />
          </div>
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

        <Button
          type="submit"
          disabled={busy}
          className="bg-navy hover:bg-navy-light text-white"
        >
          {isPending ? pendingLabel : success ? successMessage : submitLabel}
        </Button>
      </form>
    </>
  );
}
