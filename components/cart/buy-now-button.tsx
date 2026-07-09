"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import AsyncButton from "@/components/ui/async-button";
import type { Product } from "@/lib/types";

export default function BuyNowButton({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <AsyncButton
      action={async () => {
        router.push(`/checkout?buyNow=${product.id}&qty=1`);
      }}
      pendingLabel="이동 중..."
      variant="outline"
      className="flex-1 border-navy text-navy hover:bg-navy/5 h-12 text-sm"
    >
      <Zap className="mr-2 h-5 w-5" /> 바로구매
    </AsyncButton>
  );
}
