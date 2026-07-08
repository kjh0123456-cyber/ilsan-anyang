"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  function handleClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-navy hover:bg-navy-light text-white h-12 text-sm"
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" /> 담겼습니다
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" /> 장바구니 담기
        </>
      )}
    </Button>
  );
}
