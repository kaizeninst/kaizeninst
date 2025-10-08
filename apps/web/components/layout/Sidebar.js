"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  Users2,
  ReceiptText,
  ShoppingCart,
  FolderTree,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { useUser } from "@/components/layout/AdminLayoutProvider";

/* ---------------------------------------------
 * Sidebar Navigation Links
 * --------------------------------------------- */
const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/quotes", label: "Quotes", icon: ReceiptText },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  // 🔒 Staffs: admin เท่านั้น
  { href: "/admin/staffs", label: "Staffs", icon: Users2, role: "admin" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = useUser();

  // 🔹 Logout handler
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) router.replace("/admin-login");
    } catch {
      // ignore
    }
  }

  // ⏳ Loading state
  if (!user) {
    return (
      <aside className="hidden min-h-screen w-[250px] items-center justify-center border-r border-red-100 bg-white text-gray-400 md:flex">
        Loading...
      </aside>
    );
  }

  // ✅ Sidebar content
  const SidebarContent = (
    <>
      {/* Header */}
      <div className="border-b border-red-100 px-5 pb-3 pt-5">
        <div className="flex items-center justify-center gap-2">
          <span className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
            <ShieldAlert size={14} />
            ADMIN PANEL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {NAV_LINKS.filter((link) => !link.role || link.role === user.role).map(
          ({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "border border-red-200 bg-red-100 text-red-700 shadow-inner"
                    : "text-neutral-700 hover:bg-red-50 hover:text-red-600",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={[
                    "transition-transform duration-300",
                    active ? "scale-110 text-red-600" : "group-hover:scale-110",
                  ].join(" ")}
                />
                <span>{label}</span>
              </Link>
            );
          }
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-red-100 bg-white/60 p-4 backdrop-blur-sm">
        {/* User Info */}
        <div className="rounded-lg border border-gray-100 bg-white p-3 text-center shadow-sm">
          <div className="text-sm font-semibold text-neutral-800">{user.username}</div>
          <div
            className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
              user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {user.role.toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-medium text-white shadow transition-all hover:from-red-600 hover:to-red-700 active:scale-[0.98]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden min-h-screen w-[250px] flex-col border-r border-red-100 bg-gradient-to-b from-red-50 to-white shadow-sm md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile Navbar */}
      <div className="fixed left-0 top-0 z-30 flex w-full items-center justify-between border-b border-red-100 bg-white px-4 py-3 shadow-sm md:hidden">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-red-600">
          <Menu size={24} />
        </button>
        <span className="text-sm font-semibold text-red-600">Admin Panel</span>
        <div className="w-6" />
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className="animate-slideIn relative z-50 flex min-h-full w-[240px] flex-col bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-red-100 px-4 py-3">
              <span className="font-semibold text-red-600">Menu</span>
              <button onClick={() => setOpen(false)} className="text-red-500">
                <X size={20} />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
