"use client";

import { useCart } from "@/hooks/use-cart";
import CartItemRow from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const items = useCart((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy mb-2">
          장바구니가 비어있습니다
        </h2>
        <p className="text-muted-foreground mb-6">
          마음에 드는 상품을 담아보세요
        </p>
        <Link href="/products">
          <Button className="bg-navy hover:bg-navy-light text-white">
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-6">장바구니</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </div>
        <CartSummary />
      </div>
    </div>
  );
}
