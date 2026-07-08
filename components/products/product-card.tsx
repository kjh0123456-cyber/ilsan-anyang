import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  vacuum: "로봇청소기",
  air: "공기청정기",
  speaker: "스마트스피커",
  light: "스마트조명",
  hub: "IoT 허브",
};

export default function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gold transition-colors duration-200">
        <div className="relative aspect-square bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
              이미지 없음
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">품절</Badge>
            </div>
          )}
        </div>
        <div className="p-5">
          <Badge variant="outline" className="text-xs mb-2 border-gold text-gold">
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <h3 className="font-semibold text-navy text-sm leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-navy">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}
