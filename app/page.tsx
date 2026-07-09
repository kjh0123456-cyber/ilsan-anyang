import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/actions/products";
import ProductCard from "@/components/products/product-card";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  { value: "vacuum", label: "로봇청소기", emoji: "🤖" },
  { value: "air", label: "공기청정기", emoji: "💨" },
  { value: "speaker", label: "스마트스피커", emoji: "🔊" },
  { value: "light", label: "스마트조명", emoji: "💡" },
  { value: "hub", label: "IoT 허브", emoji: "🏠" },
];

export default async function HomePage() {
  let topProducts: Product[] = [];
  try {
    const featured = await getProducts({ sort: "newest" });
    topProducts = featured.slice(0, 4);
  } catch {
    // Supabase not configured yet — show empty state
    topProducts = [];
  }

  const heroProduct = topProducts[0];

  return (
    <>
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-gold/12 via-background to-background py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-12">
          <div>
            <p className="text-gold font-medium mb-2">Premium Smart Home</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-navy">
              가까운 일상,
              <br />
              스마트한 선택
            </h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-md">
              일산안양이 제안하는 프리미엄 스마트홈 가전으로
              <br />
              더 편리하고 지능적인 생활을 경험하세요.
            </p>
            <div className="flex gap-3">
              <Link href="/products">
                <Button className="bg-gold hover:bg-gold-light text-white font-semibold h-12 px-8">
                  쇼핑하기
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="border-2 border-navy text-navy hover:bg-navy/5 h-12 px-8"
                >
                  브랜드 소개
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-square max-w-md w-full mx-auto rounded-2xl overflow-hidden shadow-xl border border-gold/15 bg-white">
            {heroProduct?.images[0] ? (
              <Image
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl">
                🏠
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-navy mb-10 text-center">
            카테고리
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/products?category=${cat.value}`}
                className="bg-white rounded-lg p-6 text-center hover:border-gold border-2 border-transparent transition-colors group"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-sm font-medium text-navy group-hover:text-gold transition-colors">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 추천 상품 */}
      {topProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold text-navy">추천 상품</h2>
              <Link
                href="/products"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy"
              >
                전체 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 브랜드 강점 */}
      <section className="py-20 px-4 bg-gold/5 border-y border-gold/15">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { title: "무료 배송", desc: "5만원 이상 구매 시\n전국 무료 배송" },
            { title: "정품 보증", desc: "모든 제품 제조사\n공식 A/S 지원" },
            { title: "30일 반품", desc: "구매 후 30일 이내\n조건 없는 반품" },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-gold font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
