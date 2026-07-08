"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export default function CartSummary() {
  const total = useCart((s) => s.total());
  const SHIPPING = total >= 50000 ? 0 : 3000;

  return (
    <div className="bg-gray-50 rounded-lg p-8 space-y-4 sticky top-20">
      <h3 className="font-bold text-navy">주문 요약</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>상품 금액</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>배송비</span>
          <span>{SHIPPING === 0 ? "무료" : formatPrice(SHIPPING)}</span>
        </div>
        {total < 50000 && (
          <p className="text-xs text-gold">
            {formatPrice(50000 - total)} 더 구매 시 무료배송
          </p>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-navy">
        <span>총 결제 금액</span>
        <span>{formatPrice(total + SHIPPING)}</span>
      </div>
      <Link href="/checkout">
        <Button className="w-full bg-navy hover:bg-navy-light text-white h-12">
          구매하기
        </Button>
      </Link>
    </div>
  );
}
