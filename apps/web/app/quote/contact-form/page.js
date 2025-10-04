"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getCart, computeTotals, formatTHB } from "@/utils/cart";

const VAT_RATE = 0.07; // 7%

export default function RequestQuotePage() {
  const router = useRouter();

  // contact form
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // items from real cart
  const [items, setItems] = useState([]); // [{id, quantity, name, price, image}]
  const [loading, setLoading] = useState(true);

  // load items from localStorage cart -> bulk fetch details
  const loadFromCart = async () => {
    const base = getCart(); // [{ id, quantity }]
    if (!base.length) {
      setItems([]);
      return;
    }
    const ids = base.map((x) => x.id);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        cache: "no-store",
      });
      const json = await res.json();
      const map = new Map((json?.data || []).map((p) => [p.id, p]));
      const detailed = base.map((row) => {
        const p = map.get(row.id);
        return {
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: p?.name || "Unnamed product",
          price: Number(p?.price || 0),
          image: p?.image_path || "",
        };
      });
      setItems(detailed);
    } catch (e) {
      console.error("Bulk load failed:", e);
      setItems(
        base.map((row) => ({
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: "Unknown",
          price: 0,
          image: "",
        }))
      );
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await loadFromCart();
      if (mounted) setLoading(false);
    })();

    const onChange = async () => {
      await loadFromCart();
    };
    window.addEventListener("cart:change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      mounted = false;
      window.removeEventListener("cart:change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // computed prices (THB)
  const itemsCount = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.quantity || 0), 0),
    [items]
  );
  const { subtotal, vat, total } = useMemo(
    () =>
      computeTotals(
        items.map((x) => ({ ...x })), // uses VAT from utils by default
        VAT_RATE
      ),
    [items]
  );

  // form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // very light validation
    if (!formData.fullName || !formData.phoneNumber || !formData.emailAddress) return;

    setSubmitting(true);
    try {
      // TODO: ส่งเข้า backend จริงของคุณที่นี่ (เช่น POST /api/quotes)
      // await fetch("/api/quotes", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     contact: {
      //       fullName: formData.fullName,
      //       companyName: formData.companyName,
      //       phone: formData.phoneNumber,
      //       email: formData.emailAddress,
      //       note: formData.note,
      //     },
      //     items,
      //     totals: { subtotal, vat, total },
      //   }),
      // });

      // demo delay
      await new Promise((r) => setTimeout(r, 600));
      router.push("/quote/success");
    } catch (err) {
      console.error(err);
      alert("Failed to submit quote request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="h-18 w-18 mx-auto mb-4 flex items-center justify-center rounded-md bg-red-100">
          <MessageSquare className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="pb-2.5 text-3xl font-bold md:text-4xl">Request a Quote</h1>
        <p className="text-gray-600">
          Review your items and tell us about your requirements for a custom quote.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: Items for Quote */}
        <section className="space-y-4 rounded-lg bg-gray-50 p-6 shadow-md">
          <h2 className="text-2xl font-bold">Items for Quote</h2>

          {loading ? (
            <p className="text-gray-500">Loading items...</p>
          ) : items.length ? (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between text-gray-700">
                  <span className="truncate">{it.name}</span>
                  <span className="whitespace-nowrap">
                    {it.quantity} x {formatTHB(it.price)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md bg-gray-100 p-4 text-center text-gray-600">
              Your quote list is empty.
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-300 pt-4">
            <div className="flex justify-between font-semibold">
              <span>
                Subtotal <span className="text-gray-500">({itemsCount} items)</span>
              </span>
              <span>{formatTHB(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Estimated Tax</span>
              <span>{formatTHB(vat)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-black">
              <span>Estimated Total</span>
              <span className="text-[#A90000]">{formatTHB(total)}</span>
            </div>
          </div>

          <div className="rounded-md bg-blue-100 p-4 text-sm">
            <p className="text-sm italic text-blue-900">
              Note: This is an estimated total. Final pricing may vary based on your specific
              requirements and any customizations discussed.
            </p>
          </div>
        </section>

        {/* Right: Contact Information */}
        <section className="rounded-lg bg-white p-6 shadow-md">
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
                disabled={submitting || !items.length}
                className="rounded-lg bg-red-600 px-6 py-3 text-white shadow transition-colors hover:bg-[#a90000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Send Quote Request"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
