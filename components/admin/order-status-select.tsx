"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "paid", label: "결제완료" },
  { value: "shipping", label: "배송중" },
  { value: "delivered", label: "배송완료" },
  { value: "cancelled", label: "취소됨" },
];

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: OrderStatus) {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, next);
      } catch {
        setValue(previous);
        setError("상태 변경에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="text-sm border rounded-lg px-2 py-1 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
