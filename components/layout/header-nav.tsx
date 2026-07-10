"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { category: "vacuum", label: "로봇청소기" },
  { category: "air", label: "공기청정기" },
  { category: "speaker", label: "스마트스피커" },
  { category: "light", label: "스마트조명" },
  { category: "hub", label: "IoT 허브" },
] as const;

const linkClass =
  "text-sm whitespace-nowrap rounded-md px-2 py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/40";

// Rendered as the Suspense fallback while useSearchParams resolves on the
// client, so the nav still shows up in the prerendered HTML — just without
// the active-category highlight, which appears a moment later on hydration.
export function NavLinksFallback() {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.category}
          href={`/products?category=${link.category}`}
          className={cn(linkClass, "text-gray-600 hover:text-navy hover:bg-gray-50")}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export default function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/products" ? searchParams.get("category") : null;

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive = activeCategory === link.category;
        return (
          <Link
            key={link.category}
            href={`/products?category=${link.category}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              linkClass,
              isActive
                ? "text-navy font-semibold bg-gold/10"
                : "text-gray-600 hover:text-navy hover:bg-gray-50"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
