"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/client";
import TossPaymentWidget from "@/components/checkout/toss-payment-widget";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const SHIPPING = total >= 50000 ? 0 : 3000;
  const finalAmount = total + SHIPPING;

  useEffect(() => {
    async function prepare() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || items.length === 0) return;

      setUserEmail(user.email ?? "");
      try {
        const id = await createOrder(items, finalAmount);
        setOrderId(id);
      } catch (err) {
        console.error("Order creation failed:", err);
      }
    }
    prepare();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        장바구니가 비어있습니다.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-xl font-bold text-navy mb-8">결제</h1>
      <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-2 text-sm">
        <p className="font-medium">주문 상품 ({items.length}종)</p>
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex justify-between text-muted-foreground"
          >
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between text-muted-foreground">
          <span>배송비</span>
          <span>{SHIPPING === 0 ? "무료" : formatPrice(SHIPPING)}</span>
        </div>
        <div className="flex justify-between font-bold text-navy pt-2 border-t">
          <span>총 결제 금액</span>
          <span>{formatPrice(finalAmount)}</span>
        </div>
      </div>

      {orderId ? (
        <TossPaymentWidget
          orderId={orderId}
          amount={finalAmount}
          customerEmail={userEmail}
        />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          결제 준비 중...
        </div>
      )}
    </div>
  );
}
