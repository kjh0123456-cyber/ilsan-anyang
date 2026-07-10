import { Suspense } from "react";
import Link from "next/link";
import { ShoppingCart, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser, isAdmin, logout } from "@/lib/actions/auth";
import HeaderNav, { NavLinksFallback } from "@/components/layout/header-nav";

export default async function Header() {
  const user = await getUser();
  const admin = user ? await isAdmin(user.id) : false;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-navy whitespace-nowrap">일산안양</span>
            <span className="text-xs text-gold font-medium hidden sm:block whitespace-nowrap">
              SMART HOME
            </span>
          </Link>

          <nav
            className={`hidden items-center gap-2 shrink-0 ${
              admin ? "xl:flex" : "lg:flex"
            }`}
          >
            <Suspense fallback={<NavLinksFallback />}>
              <HeaderNav />
            </Suspense>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {admin && (
              <>
                <Badge className="hidden sm:inline-flex bg-gold/10 text-gold border border-gold/30 whitespace-nowrap">
                  관리자 모드
                </Badge>
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gold hover:text-gold hover:bg-gold/10 gap-1 whitespace-nowrap"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    관리자
                  </Button>
                </Link>
              </>
            )}
            <Link href="/cart" className="shrink-0">
              <Button variant="ghost" size="icon" aria-label="장바구니">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground max-w-40 truncate">
                  {user.email}
                </span>
                <form action={logout}>
                  <Button variant="ghost" size="sm" type="submit" className="whitespace-nowrap">
                    로그아웃
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/auth/login" className="shrink-0">
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
