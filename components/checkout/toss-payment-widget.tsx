"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AsyncButton from "@/components/ui/async-button";
import { formatPrice } from "@/lib/utils";

interface Props {
  orderId: string;
  amount: number;
  customerEmail: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
}

export default function TossPaymentWidget({
  orderId,
  amount,
  customerEmail,
  orderName,
  successUrl,
  failUrl,
}: Props) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamic import to avoid SSR issues
        const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
        );
        if (cancelled) return;
        const widget = tossPayments.widgets({ customerKey: customerEmail });
        await widget.setAmount({ currency: "KRW", value: amount });
        if (cancelled) return;
        await widget.renderPaymentMethods({
          selector: "#payment-widget",
          variantKey: "DEFAULT",
        });
        await widget.renderAgreement({ selector: "#agreement" });
        if (cancelled) return;
        widgetRef.current = widget;
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        console.error("Toss init error:", err);
        toast.error("결제 위젯을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.");
      }
    }
    init();

    return () => {
      cancelled = true;
      // Reset the widget containers so React Strict Mode's dev-only
      // mount→cleanup→remount cycle (and real re-mounts) start clean —
      // otherwise the Toss SDK throws "하나의 결제수단 위젯만을 사용할 수 있어요"
      // when renderPaymentMethods runs again on an already-mounted container.
      document.getElementById("payment-widget")?.replaceChildren();
      document.getElementById("agreement")?.replaceChildren();
    };
  }, [amount, customerEmail]);

  return (
    <div className="space-y-4">
      <div id="payment-widget" />
      <div id="agreement" />
      <AsyncButton
        action={async () => {
          if (!widgetRef.current) return;
          await widgetRef.current.requestPayment({
            orderId,
            orderName,
            customerEmail,
            successUrl,
            failUrl,
          });
        }}
        disabled={!ready}
        pendingLabel="결제창 여는 중..."
        errorMessage="결제 요청 중 오류가 발생했습니다."
        className="w-full bg-gold hover:bg-gold-light text-white h-12 text-sm"
      >
        {ready ? `${formatPrice(amount)} 결제하기` : "결제 준비 중..."}
      </AsyncButton>
    </div>
  );
}
