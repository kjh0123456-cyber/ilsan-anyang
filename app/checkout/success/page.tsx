"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/actions/orders";
import { getProductById } from "@/lib/actions/products";
import type { CartItem, ShippingInfo } from "@/lib/types";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const cartItems = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const ranRef = useRef(false);
  const [state, setState] = useState<"processing" | "done" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const tossOrderId = searchParams.get("orderId");
    const paymentKey = searchParams.get("paymentKey");
    const amount = Number(searchParams.get("amount"));
    const buyNowId = searchParams.get("buyNow");
    const buyNowQty = Number(searchParams.get("qty") ?? "1") || 1;
    const shipping: ShippingInfo = {
      recipientName: searchParams.get("recipientName") ?? "",
      phone: searchParams.get("phone") ?? "",
      zipCode: searchParams.get("zipCode") ?? "",
      address: searchParams.get("address") ?? "",
      addressDetail: searchParams.get("addressDetail") ?? "",
      deliveryRequest: searchParams.get("deliveryRequest") ?? "",
    };

    async function run() {
      if (!tossOrderId || !paymentKey || !amount) {
        setState("error");
        setErrorMessage("결제 정보가 올바르지 않습니다.");
        return;
      }

      let items: CartItem[];
      if (buyNowId) {
        const product = await getProductById(buyNowId);
        if (!product) {
          setState("error");
          setErrorMessage("상품 정보를 찾을 수 없습니다.");
          return;
        }
        items = [{ product, quantity: buyNowQty }];
      } else {
        if (cartItems.length === 0) {
          // Reload after a completed checkout — nothing left to process.
          setState("done");
          return;
        }
        items = cartItems;
      }

      try {
        await createOrder(items, amount, { tossOrderId, paymentKey }, shipping);
        if (!buyNowId) clearCart();
        toast.success("결제가 완료되었습니다.");
        setState("done");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "결제 확인 중 오류가 발생했습니다."
        );
        toast.error("결제 확인에 실패했습니다.");
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 text-navy mx-auto animate-spin" />
          <p className="text-muted-foreground">결제를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-navy">결제 확인에 실패했습니다</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <Link href="/cart">
            <Button className="bg-gold hover:bg-gold-light text-white">
              장바구니로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold text-navy">결제가 완료되었습니다</h1>
        <p className="text-muted-foreground">
          주문이 정상적으로 접수되었습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/orders">
            <Button variant="outline">주문 내역 보기</Button>
          </Link>
          <Link href="/">
            <Button className="bg-gold hover:bg-gold-light text-white">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
