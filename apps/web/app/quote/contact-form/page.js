"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import { products } from "../../../data/productsData";

const taxRate = 0.07;

export default function RequestQuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    note: "",
  });

  //data from cart page
  const cartItems = [
    { product: products[0], quantity: 2 },
    { product: products[1], quantity: 2 },
    { product: products[2], quantity: 2 },
  ];

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const tax = useMemo(() => subtotal * taxRate, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Quote request submitted:", formData);
    router.push("/success");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="h-18 w-18 mx-auto mb-4 flex items-center justify-center rounded-md bg-red-100">
              <MessageSquare className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="pb-2.5 text-4xl font-bold">Request a Quote</h1>
            <p className="text-gray-600">
              Review your items and tell us about your requirements for a custom quote.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4 rounded-lg bg-gray-50 p-6 shadow-md">
              <h2 className="text-2xl font-bold">Items for Quote</h2>
              <ul className="space-y-2">
                {cartItems.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex items-center justify-between text-gray-700"
                  >
                    <span>{item.product.name}</span>
                    <span>
                      {item.quantity} x ${item.product.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-gray-300 pt-4">
                <div className="flex justify-between font-semibold">
                  <span>
                    Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black">
                  <span>Estimated Total</span>
                  <span className="text-[#A90000]">THB {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="rounded-md bg-blue-100 p-4 text-sm">
                <p className="text-sm italic text-blue-900">
                  Note: This is an estimated total. Final pricing may vary based on your specific
                  requirements and any customizations discussed.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Contact Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    id="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Note
                  </label>
                  <textarea
                    name="note"
                    id="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Link href="/cart" className="text-blue-600 hover:underline">
                    Back to cart
                  </Link>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-6 py-3 text-white shadow transition-colors hover:bg-[#a90000]"
                  >
                    <Link href="/quote/success" className="hover:underline">
                      Send Quote Request
                    </Link>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
