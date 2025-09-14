"use client";
import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-6 text-sm text-gray-600">
      {items.map((item, idx) => (
        <span key={idx}>
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-800">{item.label}</span>
          )}
          {idx < items.length - 1 && " > "}
        </span>
      ))}
    </nav>
  );
}
