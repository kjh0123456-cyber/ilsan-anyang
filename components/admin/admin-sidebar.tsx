"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/orders", label: "주문 관리" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = NAV_ITEMS.map((nav) => (
    <Link
      key={nav.href}
      href={nav.href}
      onClick={() => setIsOpen(false)}
      className={`block text-sm py-1 ${
        pathname === nav.href
          ? "text-navy font-semibold"
          : "text-navy/70 hover:text-navy"
      }`}
    >
      {nav.label}
    </Link>
  ));

  return (
    <>
      <div className="lg:hidden flex items-center justify-between bg-gold/5 border-b border-gold/15 px-4 py-3">
        <p className="text-gold font-bold text-sm">관리자</p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="관리자 메뉴 열기"
          className="p-1 text-navy"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className="hidden lg:block w-48 bg-gold/5 border-r border-gold/15 p-4 space-y-2 shrink-0">
        <p className="text-gold font-bold mb-4 text-sm">관리자</p>
        {navLinks}
      </aside>

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-white border-r border-gold/15 p-4 space-y-2 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-gold font-bold text-sm">관리자</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="관리자 메뉴 닫기"
            className="p-1 text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navLinks}
      </aside>
    </>
  );
}
