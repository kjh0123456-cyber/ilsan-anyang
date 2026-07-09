import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductForAdmin } from "@/lib/actions/products";
import ProductForm from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductForAdmin(id);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-navy">상품 수정</h1>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-navy"
        >
          목록으로
        </Link>
      </div>

      <ProductForm product={product} submitLabel="수정하기" />
    </div>
  );
}
