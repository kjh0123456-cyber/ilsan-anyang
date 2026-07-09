import Link from "next/link";
import { ShoppingCart, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser, isAdmin, logout } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/products?category=vacuum", label: "로봇청소기" },
  { href: "/products?category=air", label: "공기청정기" },
  { href: "/products?category=speaker", label: "스마트스피커" },
  { href: "/products?category=light", label: "스마트조명" },
  { href: "/products?category=hub", label: "IoT 허브" },
];

export default async function Header() {
  const user = await getUser();
  const admin = user ? await isAdmin(user.id) : false;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-navy">일산안양</span>
            <span className="text-xs text-gold font-medium hidden sm:block">
              SMART HOME
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {admin && (
              <>
                <Badge className="hidden sm:inline-flex bg-gold/10 text-gold border border-gold/30">
                  관리자 모드
                </Badge>
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gold hover:text-gold hover:bg-gold/10 gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    관리자
                  </Button>
                </Link>
              </>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="장바구니">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {user ? (
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  로그아웃
                </Button>
              </form>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" aria-label="로그인">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
