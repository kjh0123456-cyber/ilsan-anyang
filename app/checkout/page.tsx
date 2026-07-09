"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { getProductById } from "@/lib/actions/products";
import { createClient } from "@/lib/supabase/client";
import TossPaymentWidget from "@/components/checkout/toss-payment-widget";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("buyNow");
  const buyNowQty = Number(searchParams.get("qty") ?? "1") || 1;

  const cartItems = useCart((s) => s.items);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [loadingBuyNow, setLoadingBuyNow] = useState(!!buyNowId);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [authRetryKey, setAuthRetryKey] = useState(0);
  const [tossOrderId] = useState(() => crypto.randomUUID());

  const items = useMemo(
    () => (buyNowId ? (buyNowItem ? [buyNowItem] : []) : cartItems),
    [buyNowId, buyNowItem, cartItems]
  );
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );
  const SHIPPING = total >= 50000 ? 0 : 3000;
  const finalAmount = total + SHIPPING;

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      setAuthError(false);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user) {
          router.push(
            `/auth/login?redirect=${encodeURIComponent(
              `/checkout${window.location.search}`
            )}`
          );
          return;
        }
        setUserEmail(user.email ?? "");
      } catch {
        // Transient network failure talking to Supabase Auth — don't strand
        // the user on an infinite "불러오는 중..." with no way out.
        if (!cancelled) setAuthError(true);
      }
    }
    prepare();

    return () => {
      cancelled = true;
    };
  }, [router, authRetryKey]);

  useEffect(() => {
    if (!buyNowId) return;
    let cancelled = false;
    getProductById(buyNowId).then((product) => {
      if (cancelled) return;
      if (product) {
        setBuyNowItem({ product, quantity: buyNowQty });
      }
      setLoadingBuyNow(false);
    });
    return () => {
      cancelled = true;
    };
  }, [buyNowId, buyNowQty]);

  if (authError) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-muted-foreground">
          로그인 상태를 확인하지 못했습니다. 네트워크 연결을 확인해주세요.
        </p>
        <Button
          variant="outline"
          onClick={() => setAuthRetryKey((k) => k + 1)}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (loadingBuyNow || userEmail === null) {
    return (
      <div className="text-center py-20 text-muted-foreground">불러오는 중...</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        {buyNowId ? "상품을 찾을 수 없습니다." : "장바구니가 비어있습니다."}
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const successUrl = buyNowId
    ? `${baseUrl}/checkout/success?buyNow=${buyNowId}&qty=${buyNowQty}`
    : `${baseUrl}/checkout/success`;
  const failUrl = `${baseUrl}/checkout/fail`;

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

      <TossPaymentWidget
        orderId={tossOrderId}
        amount={finalAmount}
        customerEmail={userEmail}
        orderName={
          items.length > 1
            ? `${items[0].product.name} 외 ${items.length - 1}건`
            : items[0].product.name
        }
        successUrl={successUrl}
        failUrl={failUrl}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
