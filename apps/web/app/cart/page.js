"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Image from "next/image";
import { products } from "../../data/productsdata";
import { getCart, updateQuantity, removeFromCart } from "../../utils/cart";
import { Trash2 } from "lucide-react";

const taxRate = 0.07;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = getCart();
    const restoredItems = storedCart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter(Boolean);
    setCartItems(restoredItems);
  }, []);

  // Handle quantity change
  const handleQuantityChange = (id, delta) => {
    const updated = cartItems.map((item) =>
      item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCartItems(updated);

    // Update localStorage
    const cartToSave = updated.map((item) => ({
      id: item.product.id,
      quantity: item.quantity,
    }));
    updateQuantity(id, updated.find((item) => item.product.id === id)?.quantity);
  };

  const handleRemove = (id) => {
    const updated = cartItems.filter((item) => item.product.id !== id);
    setCartItems(updated);
    removeFromCart(id);
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const tax = useMemo(() => subtotal * taxRate, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal]);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Link href="/products" className="text-red-700 hover:text-red-900 hover:underline">
          &larr; Continue Shopping
        </Link>
      </div>

      <h1 className="text-4xl font-bold">Shopping Cart</h1>

      <div className="flex flex-col gap-8 md:grid md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col gap-y-4 rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center sm:gap-x-4"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-[#A80000]">${item.product.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, -1)}
                    className="rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, 1)}
                    className="rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center justify-end space-x-3 sm:ml-4">
                  <div className="font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">Your cart is empty.</div>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-lg bg-gray-50 p-6 shadow-md">
          <h2 className="text-2xl font-bold">Order Summary</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-[#A90000]">${total.toFixed(2)}</span>
          </div>
          <Link
            href="/quote/contact-form"
            className="block w-full rounded-lg bg-red-600 px-6 py-3 text-center text-white hover:bg-red-700"
          >
            Proceed to request quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto flex-grow px-4 py-8">
        <Cart />
      </main>
    </div>
  );
}
