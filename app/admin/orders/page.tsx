import { getOrders, updateOrderStatus } from "@/lib/actions/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { Order } from "@/lib/types";

const STATUS_OPTIONS = ["paid", "shipping", "delivered", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  paid: "결제완료",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소됨",
};

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  try {
    orders = await getOrders();
  } catch {
    orders = [];
  }

  async function changeStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    await updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
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
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    #{order.id.slice(0, 8)}
                  </span>
                </div>
                <form action={changeStatus} className="flex items-center gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="text-sm border rounded-lg px-2 py-1"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="text-xs bg-navy text-white px-3 py-1 rounded-lg hover:bg-navy-light"
                  >
                    변경
                  </button>
                </form>
              </div>
              <p className="font-bold text-navy">
                {formatPrice(order.total_amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
