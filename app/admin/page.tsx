import Link from "next/link";
import { getAllProducts } from "@/lib/actions/products";
import { getAllOrdersForAdmin } from "@/lib/actions/orders";
import { formatPrice, toKstDateString, toKstYearMonth } from "@/lib/utils";
import type { Product, Order } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboard() {
  let products: Product[] = [];
  let orders: Order[] = [];
  try {
    [products, orders] = await Promise.all([
      getAllProducts(),
      getAllOrdersForAdmin(),
    ]);
  } catch {
    // Supabase not configured — show zeros
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const now = new Date();
  const today = toKstDateString(now);
  const thisMonth = toKstYearMonth(now);

  const todayOrderCount = orders.filter(
    (o) => toKstDateString(new Date(o.created_at)) === today
  ).length;

  const thisMonthRevenue = orders
    .filter(
      (o) =>
        o.status !== "cancelled" &&
        toKstYearMonth(new Date(o.created_at)) === thisMonth
    )
    .reduce((sum, o) => sum + o.total_amount, 0);

  const lowStockProducts = products
    .filter(
      (p) => p.is_active && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
    )
    .sort((a, b) => a.stock - b.stock);

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

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-sm text-muted-foreground">오늘 주문</p>
          <p className="text-xl font-bold text-navy mt-1">
            {todayOrderCount}건
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-sm text-muted-foreground">이번달 매출</p>
          <p className="text-xl font-bold text-navy mt-1">
            {formatPrice(thisMonthRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border mt-6">
        <div className="p-6 pb-0">
          <h2 className="font-semibold text-navy">
            품절 임박 상품 (재고 {LOW_STOCK_THRESHOLD}개 이하)
          </h2>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6">
            품절 임박 상품이 없습니다.
          </p>
        ) : (
          <ul className="divide-y mt-3">
            {lowStockProducts.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between px-6 py-3 text-sm"
              >
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-navy hover:underline"
                >
                  {product.name}
                </Link>
                <span className="text-destructive font-medium">
                  재고 {product.stock}개
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
