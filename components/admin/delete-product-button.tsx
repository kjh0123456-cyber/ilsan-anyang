"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/products";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`'${productName}' 상품을 삭제(판매 중단)하시겠습니까?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "삭제 중..." : "삭제"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
