"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
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
  const formRef = useRef<HTMLFormElement>(null);
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(
    null
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

  function submitForm(formData: FormData) {
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

  function handleOpenPreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setPendingFormData(new FormData(e.currentTarget));
    setPreviewOpen(true);
  }

  function handleConfirm() {
    if (!pendingFormData) return;
    setPreviewOpen(false);
    submitForm(pendingFormData);
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

  const previewImage = existingImages[0] ?? newImagePreviews[0] ?? null;
  const previewCategoryLabel = CATEGORY_OPTIONS.find(
    (c) => c.value === pendingFormData?.get("category")
  )?.label;
  const previewName = (pendingFormData?.get("name") as string) ?? "";
  const previewDescription =
    (pendingFormData?.get("description") as string) ?? "";
  const previewPrice = Number(priceDisplay.replace(/,/g, "")) || 0;

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

      <form
        ref={formRef}
        onSubmit={handleOpenPreview}
        className="space-y-4 max-w-xl"
      >
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

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={busy}
            className="bg-navy hover:bg-navy-light text-white"
          >
            {isPending ? pendingLabel : success ? successMessage : submitLabel}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={busy}>
              취소
            </Button>
          </Link>
        </div>
      </form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>등록 전 미리보기</DialogTitle>
          </DialogHeader>

          <div className="max-w-xs mx-auto w-full">
            <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
              <div className="relative aspect-square bg-gray-50">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={previewName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="p-5">
                {previewCategoryLabel && (
                  <Badge
                    variant="outline"
                    className="text-xs mb-2 border-gold text-gold"
                  >
                    {previewCategoryLabel}
                  </Badge>
                )}
                <h3 className="font-semibold text-navy text-sm leading-tight mb-1">
                  {previewName || "(상품명 없음)"}
                </h3>
                <p className="text-xl font-bold text-navy mb-2">
                  {formatPrice(previewPrice)}
                </p>
                {previewDescription && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {previewDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              수정하기
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-navy hover:bg-navy-light text-white"
            >
              확인 및 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
