"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "paid", label: "결제완료" },
  { value: "shipping", label: "배송중" },
  { value: "delivered", label: "배송완료" },
  { value: "cancelled", label: "취소됨" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
) as Record<OrderStatus, string>;

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: OrderStatus) {
    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, next);
        toast.success(`주문 상태를 '${STATUS_LABELS[next]}'(으)로 변경했습니다.`);
      } catch {
        setValue(previous);
        toast.error("상태 변경에 실패했습니다.");
      }
    });
  }

  return (
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
  );
}
