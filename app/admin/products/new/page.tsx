import Link from "next/link";
import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-navy">상품 등록</h1>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-navy"
        >
          목록으로
        </Link>
      </div>

      <ProductForm submitLabel="등록하기" />
    </div>
  );
}
