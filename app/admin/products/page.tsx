import Link from "next/link";
import { getAllProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteProductButton from "@/components/admin/delete-product-button";
import RestoreProductButton from "@/components/admin/restore-product-button";
import ShowDeletedToggle from "@/components/admin/show-deleted-toggle";
import type { Product } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  vacuum: "로봇청소기",
  air: "공기청정기",
  speaker: "스마트스피커",
  light: "스마트조명",
  hub: "IoT 허브",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ showDeleted?: string }>;
}) {
  const params = await searchParams;
  const showDeleted = params.showDeleted === "1";

  let products: Product[] = [];
  try {
    products = await getAllProducts(showDeleted);
  } catch {
    products = [];
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="text-xl font-bold text-navy whitespace-nowrap">상품 관리</h1>
        <Link href="/admin/products/new">
          <Button className="bg-gold hover:bg-gold-light text-white whitespace-nowrap">
            상품 등록
          </Button>
        </Link>
      </div>
      <div className="mb-4">
        <ShowDeletedToggle checked={showDeleted} />
      </div>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-muted-foreground">
            <tr>
              <th className="text-left p-3 whitespace-nowrap">상품명</th>
              <th className="text-left p-3 whitespace-nowrap">카테고리</th>
              <th className="text-right p-3 whitespace-nowrap">가격</th>
              <th className="text-right p-3 whitespace-nowrap">재고</th>
              <th className="text-center p-3 whitespace-nowrap">상태</th>
              <th className="text-right p-3 whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {showDeleted
                    ? "삭제된 상품이 없습니다."
                    : "상품이 없습니다. Supabase를 설정하고 샘플 데이터를 추가해주세요."}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isDeleted = !!product.deleted_at;
                return (
                  <tr
                    key={product.id}
                    className={
                      isDeleted ? "bg-gray-50/60 text-muted-foreground" : "hover:bg-gray-50"
                    }
                  >
                    <td className="p-3 font-medium whitespace-nowrap">{product.name}</td>
                    <td className="p-3 whitespace-nowrap">{CATEGORY_LABELS[product.category]}</td>
                    <td className="p-3 text-right whitespace-nowrap">{formatPrice(product.price)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {product.stock}개
                      {!isDeleted && product.stock === 0 && (
                        <Badge variant="destructive" className="ml-2">
                          품절
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {isDeleted ? (
                        <Badge variant="destructive">삭제됨</Badge>
                      ) : (
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "판매중" : "중단"}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {isDeleted ? (
                          <RestoreProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        ) : (
                          <>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button type="button" variant="outline" size="sm">
                                수정
                              </Button>
                            </Link>
                            <DeleteProductButton
                              productId={product.id}
                              productName={product.name}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
