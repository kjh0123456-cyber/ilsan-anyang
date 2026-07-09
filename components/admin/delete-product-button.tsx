"use client";

import AsyncButton from "@/components/ui/async-button";
import { deleteProduct } from "@/lib/actions/products";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <AsyncButton
      variant="destructive"
      size="sm"
      pendingLabel="삭제 중..."
      confirmMessage={`'${productName}' 상품을 삭제하시겠습니까? ('삭제된 상품 보기'에서 복구할 수 있습니다.)`}
      successMessage={`'${productName}' 상품을 삭제했습니다.`}
      action={() => deleteProduct(productId)}
    >
      삭제
    </AsyncButton>
  );
}
