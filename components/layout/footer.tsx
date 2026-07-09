import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gold/5 text-navy border-t border-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-2">일산안양</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              가까운 일상, 스마트한 선택.<br />
              2026년 경기도에서 시작된<br />
              프리미엄 스마트홈 가전 브랜드
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">카테고리</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/products?category=vacuum"
                  className="hover:text-gold transition-colors"
                >
                  로봇청소기
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=air"
                  className="hover:text-gold transition-colors"
                >
                  공기청정기
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=speaker"
                  className="hover:text-gold transition-colors"
                >
                  스마트스피커
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=light"
                  className="hover:text-gold transition-colors"
                >
                  스마트조명
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=hub"
                  className="hover:text-gold transition-colors"
                >
                  IoT 허브
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">고객지원</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-gold transition-colors"
                >
                  회사소개
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-gold transition-colors"
                >
                  주문조회
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-gold transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-gold transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gold/15 mt-8 pt-6 text-xs text-muted-foreground">
          <p>경기도 고양시 일산동구 중앙로 | 사업자등록번호: 123-45-67890</p>
          <p className="mt-1">
            © 2026 일산안양(Ilsan-Anyang). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
