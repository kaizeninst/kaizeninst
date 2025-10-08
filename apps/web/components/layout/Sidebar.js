"use client";

import { useState, useEffect } from "react";
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

/* ---------------------------------------------
 * Sidebar Navigation Links
 * --------------------------------------------- */
const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/quotes", label: "Quotes", icon: ReceiptText },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  // Staffs จะ render เฉพาะ role = admin
  { href: "/admin/staffs", label: "Staffs", icon: Users2, role: "admin" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  /* ---------------------------------------------
   * Fetch current user (from JWT payload)
   * --------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data?.authenticated) setUser(data.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  /* ---------------------------------------------
   * Logout handler
   * --------------------------------------------- */
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

  /* ---------------------------------------------
   * Sidebar Content
   * --------------------------------------------- */
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
        {NAV_LINKS.filter((link) => !link.role || link.role === user?.role).map(
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
        <div>
          <div className="text-sm font-semibold text-neutral-800">
            {user?.username || "Loading..."}
          </div>
          <div className="text-xs capitalize text-neutral-500">{user?.role || ""}</div>
        </div>

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

  /* ---------------------------------------------
   * Layout Rendering
   * --------------------------------------------- */
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

          {/* Drawer Content */}
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
