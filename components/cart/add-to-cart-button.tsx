"use client";

import { ShoppingCart } from "lucide-react";
import AsyncButton from "@/components/ui/async-button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <AsyncButton
      action={async () => {
        addItem(product);
      }}
      successMessage={`${product.name}이(가) 장바구니에 담겼습니다.`}
      pendingLabel="담는 중..."
      className="flex-1 bg-gold hover:bg-gold-light text-white h-12 text-sm"
    >
      <ShoppingCart className="mr-2 h-5 w-5" /> 장바구니 담기
    </AsyncButton>
  );
}
