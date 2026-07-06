import { getOrders } from "@/lib/actions/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  paid: { label: "결제완료", variant: "default" },
  shipping: { label: "배송중", variant: "secondary" },
  delivered: { label: "배송완료", variant: "outline" },
  cancelled: { label: "취소됨", variant: "outline" },
};

export default async function OrdersPage() {
  let orders: Order[] = [];
  try {
    orders = await getOrders();
  } catch {
    orders = [];
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy mb-2">
          주문 내역이 없습니다
        </h2>
        <p className="text-muted-foreground">첫 구매를 시작해보세요</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-6">주문 내역</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = STATUS_LABELS[order.status] ?? {
            label: order.status,
            variant: "outline" as const,
          };
          return (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    주문번호: {order.id.slice(0, 8)}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-1 border-b last:border-0"
                >
                  <span className="text-gray-700">
                    {item.product?.name ?? "상품"} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-navy mt-3">
                <span>합계</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
