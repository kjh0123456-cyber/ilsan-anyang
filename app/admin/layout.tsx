import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .single();
  return !!data;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 bg-navy text-white p-4 space-y-2 shrink-0">
        <p className="text-gold font-bold mb-4 text-sm">관리자</p>
        {[
          { href: "/admin", label: "대시보드" },
          { href: "/admin/products", label: "상품 관리" },
          { href: "/admin/orders", label: "주문 관리" },
        ].map((nav) => (
          <Link
            key={nav.href}
            href={nav.href}
            className="block text-sm text-gray-300 hover:text-white py-1"
          >
            {nav.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
