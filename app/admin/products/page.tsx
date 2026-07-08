import Link from "next/link";
import { getAllProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  vacuum: "로봇청소기",
  air: "공기청정기",
  speaker: "스마트스피커",
  light: "스마트조명",
  hub: "IoT 허브",
};

export default async function AdminProductsPage() {
  let products: Product[] = [];
  try {
    products = await getAllProducts();
  } catch {
    products = [];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-navy">상품 관리</h1>
        <Link href="/admin/products/new">
          <Button className="bg-navy hover:bg-navy-light text-white">
            상품 등록
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted-foreground">
            <tr>
              <th className="text-left p-3">상품명</th>
              <th className="text-left p-3">카테고리</th>
              <th className="text-right p-3">가격</th>
              <th className="text-right p-3">재고</th>
              <th className="text-center p-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  상품이 없습니다. Supabase를 설정하고 샘플 데이터를 추가해주세요.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{CATEGORY_LABELS[product.category]}</td>
                  <td className="p-3 text-right">{formatPrice(product.price)}</td>
                  <td className="p-3 text-right">{product.stock}개</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                    >
                      {product.is_active ? "판매중" : "중단"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
