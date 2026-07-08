import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/products";
import { getReviews } from "@/lib/actions/reviews";
import { getUser } from "@/lib/actions/auth";
import ProductImageGallery from "@/components/products/product-image-gallery";
import ReviewList from "@/components/reviews/review-list";
import ReviewForm from "@/components/reviews/review-form";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  vacuum: "로봇청소기",
  air: "공기청정기",
  speaker: "스마트스피커",
  light: "스마트조명",
  hub: "IoT 허브",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, reviews, user] = await Promise.all([
    getProductById(id),
    getReviews(id),
    getUser(),
  ]);

  if (!product) notFound();

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImageGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div>
            <Badge
              variant="outline"
              className="border-gold text-gold mb-2"
            >
              {CATEGORY_LABELS[product.category]}
            </Badge>
            <h1 className="text-xl font-bold text-navy">{product.name}</h1>
            <p className="text-xl font-bold text-navy mt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {isOutOfStock ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-500 font-medium">
                현재 품절된 상품입니다
              </p>
            </div>
          ) : (
            <AddToCartButton product={product} />
          )}

          {Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="font-semibold text-navy mb-3">제품 사양</h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 pr-4 text-muted-foreground w-1/3">
                        {key}
                      </td>
                      <td className="py-2 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-bold text-navy mb-6">구매 후기</h2>
        <ReviewList reviews={reviews} />
        {user && (
          <div className="mt-6">
            <ReviewForm productId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
}
