"use client";

import AsyncButton from "@/components/ui/async-button";
import { restoreProduct } from "@/lib/actions/products";

export default function RestoreProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <AsyncButton
      variant="outline"
      size="sm"
      pendingLabel="복구 중..."
      confirmMessage={`'${productName}' 상품을 복구해서 다시 판매중으로 되돌리시겠습니까?`}
      successMessage={`'${productName}' 상품을 복구했습니다.`}
      action={() => restoreProduct(productId)}
    >
      복구
    </AsyncButton>
  );
}
