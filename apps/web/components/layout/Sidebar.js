"use client";

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
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/staffs", label: "Staffs", icon: Users2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/quotes", label: "Quotes", icon: ReceiptText },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) router.replace("/admin-login");
    } catch {
      // noop
    }
  }

  return (
    <aside className="hidden min-h-screen w-[240px] flex-col border-r border-violet-300/70 bg-white md:flex">
      <div className="px-4 pb-3 pt-4">
        <span className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          <ShieldAlert size={14} /> ADMIN
        </span>
      </div>

      <nav className="flex-1 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "border border-neutral-200 bg-neutral-100 text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4">
        <div className="text-sm font-semibold">Admin001</div>
        <div className="text-xs text-neutral-500">Ratchaphon Khawkhiew</div>

        <button
          onClick={onLogout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
