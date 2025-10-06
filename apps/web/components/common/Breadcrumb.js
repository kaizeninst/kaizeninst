"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500"
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-primary font-medium text-gray-600 transition-colors hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-semibold">{item.label}</span>
          )}
          {idx < items.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      ))}
    </nav>
  );
}
