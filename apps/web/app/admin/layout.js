// app/admin/layout.js
import Sidebar from "@/components/layout/Sidebar";
import AdminLayoutProvider from "@/components/layout/AdminLayoutProvider";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({ children }) {
  // ✅ fetch แบบ relative path (ใช้ rewrite proxy ได้เลย)
  let user = null;
  try {
    const res = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });
    const data = await res.json();
    if (data?.authenticated) user = data.user;
  } catch {
    // ignore
  }

  return (
    <AdminLayoutProvider user={user}>
      <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
        <Sidebar />
        <main className="min-h-screen w-full flex-1 overflow-x-hidden p-4 pt-[64px] transition-all duration-300 md:pt-6">
          {children}
        </main>
      </div>
    </AdminLayoutProvider>
  );
}
