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

/* ============================================================
   CART PAGE COMPONENT
   ============================================================ */
export default function CartPage() {
  /* ------------------------------------------------------------
     State Management
     ------------------------------------------------------------ */
  const [cartItems, setCartItems] = useState([]); // [{ id, name, price, image, quantity }]

  /* ------------------------------------------------------------
     Load Cart Data from Local Storage or API
     ------------------------------------------------------------ */
  useEffect(() => {
    async function loadCartData() {
      const detailedCartItems = await getCartDetailed();
      setCartItems(detailedCartItems);
    }

    loadCartData();

    const handleCartChange = () => loadCartData();
    window.addEventListener("cart:change", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("cart:change", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  /* ------------------------------------------------------------
     Update Item Quantity
     (Defer side-effect to avoid React state race condition)
     ------------------------------------------------------------ */
  function handleQuantityChange(productId, delta) {
    setCartItems((previousItems) => {
      const updatedItems = previousItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      );

      const newQuantity = updatedItems.find((x) => x.id === productId)?.quantity || 1;
      setTimeout(() => updateQuantity(productId, newQuantity), 0);
      return updatedItems;
    });
  }

  /* ------------------------------------------------------------
     Remove Item from Cart
     (Defer side-effect to keep state updates clean)
     ------------------------------------------------------------ */
  function handleRemoveItem(productId) {
    setCartItems((previousItems) => previousItems.filter((item) => item.id !== productId));
    setTimeout(() => removeFromCart(productId), 0);
  }

  /* ------------------------------------------------------------
     Compute Order Totals
     ------------------------------------------------------------ */
  const { subtotal, vat, total } = useMemo(() => computeTotals(cartItems), [cartItems]);

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ------------------------------------------------------------
         Back to Product List
         ------------------------------------------------------------ */}
      <div className="mb-4">
        <Link href="/products" className="text-red-700 hover:text-red-900 hover:underline">
          &larr; Continue Shopping
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* ------------------------------------------------------------
           Cart Items Section
           ------------------------------------------------------------ */}
        <div className="md:col-span-2">
          {cartItems.length > 0 ? (
            <ul className="space-y-4">
              {cartItems.map((item) => {
                const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <li key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                      {/* Product Image */}
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gray-100 sm:h-20 sm:w-20">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs text-gray-500">No Image</span>
                        )}
                      </div>

                      {/* Product Name and Unit Price */}
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-primary text-sm">{formatTHB(item.price)}</div>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total and Remove Button */}
                      <div className="ml-auto flex items-center gap-3">
                        <div className="whitespace-nowrap font-semibold">
                          {formatTHB(lineTotal)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
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

        {/* ------------------------------------------------------------
           Order Summary Section
           ------------------------------------------------------------ */}
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
            Proceed to Request Quote
          </Link>
        </aside>
      </div>
    </div>
  );
}
