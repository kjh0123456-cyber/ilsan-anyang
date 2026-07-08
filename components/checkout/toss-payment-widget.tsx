"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface Props {
  orderId: string;
  amount: number;
  customerEmail: string;
}

export default function TossPaymentWidget({
  orderId,
  amount,
  customerEmail,
}: Props) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      try {
        // Dynamic import to avoid SSR issues
        const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
        );
        const widget = tossPayments.widgets({ customerKey: customerEmail });
        await widget.setAmount({ currency: "KRW", value: amount });
        await widget.renderPaymentMethods({
          selector: "#payment-widget",
          variantKey: "DEFAULT",
        });
        await widget.renderAgreement({ selector: "#agreement" });
        widgetRef.current = widget;
        setReady(true);
      } catch (err) {
        console.error("Toss init error:", err);
      }
    }
    init();
  }, [amount, customerEmail]);

  async function handlePay() {
    if (!widgetRef.current) return;
    try {
      await widgetRef.current.requestPayment({
        orderId,
        orderName: "일산안양 스마트홈 가전",
        customerEmail,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        failUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/fail`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div id="payment-widget" />
      <div id="agreement" />
      <Button
        onClick={handlePay}
        disabled={!ready}
        className="w-full bg-navy hover:bg-navy-light text-white h-12 text-sm"
      >
        {ready ? `${formatPrice(amount)} 결제하기` : "결제 준비 중..."}
      </Button>
    </div>
  );
}
