"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  getCartDetailed,
  updateQuantity,
  removeFromCart,
  computeTotals,
  formatTHB,
} from "@/utils/cart";

export default function CartPage() {
  const [items, setItems] = useState([]); // [{ id, name, price, image, quantity }]

  // Load cart with latest prices from API + sync on changes
  useEffect(() => {
    async function load() {
      const detailed = await getCartDetailed();
      setItems(detailed);
    }
    load();

    const onChange = () => load();
    window.addEventListener("cart:change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cart:change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Update quantity (avoid cross-component setState error by deferring side-effects)
  const handleQty = (id, delta) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it
      );
      const q = next.find((x) => x.id === id)?.quantity || 1;
      setTimeout(() => updateQuantity(id, q), 0); // defer localStorage + event
      return next;
    });
  };

  // Remove line (also defer side-effect)
  const handleRemove = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setTimeout(() => removeFromCart(id), 0);
  };

  // Totals
  const { subtotal, vat, total } = useMemo(() => computeTotals(items), [items]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/products" className="text-red-700 hover:text-red-900 hover:underline">
          &larr; Continue Shopping
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left: items */}
        <div className="md:col-span-2">
          {items.length ? (
            <ul className="space-y-4">
              {items.map((it) => {
                const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);
                return (
                  <li key={it.id} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                      {/* Image */}
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gray-100 sm:h-20 sm:w-20">
                        {it.image ? (
                          <Image
                            src={it.image}
                            alt={it.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs text-gray-500">No Image</span>
                        )}
                      </div>

                      {/* Name + unit price */}
                      <div className="flex-1">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-primary text-sm">{formatTHB(it.price)}</div>
                      </div>

                      {/* Qty control */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQty(it.id, -1)}
                          className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center font-semibold">{it.quantity}</span>
                        <button
                          onClick={() => handleQty(it.id, 1)}
                          className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total + delete */}
                      <div className="ml-auto flex items-center gap-3">
                        <div className="whitespace-nowrap font-semibold">
                          {formatTHB(lineTotal)}
                        </div>
                        <button
                          onClick={() => handleRemove(it.id)}
                          className="text-primary hover:text-red-800"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
              Your cart is empty.
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <aside className="h-fit rounded-lg bg-gray-50 p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Order Summary</h2>

          <div className="space-y-2 text-gray-700">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatTHB(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatTHB(vat)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatTHB(total)}</span>
          </div>

          <Link
            href="/quote/contact-form"
            className="bg-primary mt-4 block w-full rounded-[5px] py-3 text-center font-semibold text-white transition-colors hover:bg-red-700"
          >
            Proceed to request quote
          </Link>
        </aside>
      </div>
    </div>
  );
}
