import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/actions/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

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
    <div className="flex flex-col lg:flex-row min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
