import { getAllProducts } from "@/lib/actions/products";
import { getOrders } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import type { Product, Order } from "@/lib/types";

export default async function AdminDashboard() {
  let products: Product[] = [];
  let orders: Order[] = [];
  try {
    [products, orders] = await Promise.all([getAllProducts(), getOrders()]);
  } catch {
    // Supabase not configured — show zeros
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-8">대시보드</h1>
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "전체 상품", value: `${products.length}개` },
          { label: "전체 주문", value: `${orders.length}건` },
          { label: "총 매출", value: formatPrice(totalRevenue) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-6 border">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold text-navy mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
