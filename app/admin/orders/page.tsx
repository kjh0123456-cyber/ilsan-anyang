import { getAllOrdersForAdmin } from "@/lib/actions/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/order-status-select";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  try {
    orders = await getAllOrdersForAdmin();
  } catch {
    orders = [];
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-8">주문 관리</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">주문이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} · 주문번호 #
                    {order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm font-medium text-navy mt-1">
                    {order.buyer_email ?? "알 수 없는 사용자"}
                  </p>
                </div>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>

              <div className="border-t pt-3 space-y-1">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.product?.name ?? "상품"} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-navy mt-3 pt-3 border-t">
                <span>합계</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
