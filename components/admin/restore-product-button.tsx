"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { restoreProduct } from "@/lib/actions/products";

export default function RestoreProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRestore() {
    if (!confirm(`'${productName}' 상품을 복구해서 다시 판매중으로 되돌리시겠습니까?`))
      return;
    setError(null);
    startTransition(async () => {
      const result = await restoreProduct(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleRestore}
      >
        {isPending ? "복구 중..." : "복구"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
