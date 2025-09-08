"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { products } from "../../data/productsdata";

const taxRate = 0.07;

const Cart = () => {
  // Sample cart items
  const [cartItems, setCartItems] = useState([
    { product: products[0], quantity: 2 },
    { product: products[1], quantity: 2 },
    { product: products[2], quantity: 2 },
  ]);

  const handleQuantityChange = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.product.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const tax = useMemo(() => subtotal * taxRate, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal]);

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Link href="/products" className="text-red-700 hover:text-red-900 hover:underline">
          &larr; Continue Shopping
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Shopping Cart</h1>
      </div>

      {/* item list + summary */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-6 md:col-span-2">
          {cartItems.map((item) => (
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
                <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.product.id, -1)}
                  className="rounded-full bg-gray-200 px-3 py-1 transition-colors hover:bg-gray-300"
                >
                  -
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product.id, 1)}
                  className="rounded-full bg-gray-200 px-3 py-1 transition-colors hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* Price + Remove */}
              <div className="flex items-center justify-between sm:ml-4 sm:flex-col sm:items-end sm:space-y-2">
                <div className="font-semibold">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-600 transition-colors hover:text-red-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="py-12 text-center text-gray-500">Your cart is empty.</div>
          )}
        </div>

        {/* Order summary */}
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
            <span>${total.toFixed(2)}</span>
          </div>
          <Link
            href="/quote/contact-form"
            className="block w-full rounded-lg bg-red-600 px-6 py-3 text-center text-white shadow transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-8">{Cart()}</main>
      <Footer />
    </div>
  );
}
