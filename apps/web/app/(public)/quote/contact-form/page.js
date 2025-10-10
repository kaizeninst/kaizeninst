"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getCart, computeTotals, formatTHB, clearCart } from "@/utils/cart";

/* ============================================================
   REQUEST QUOTE PAGE COMPONENT
   ============================================================ */
export default function RequestQuotePage() {
  const router = useRouter();

  /* ------------------------------------------------------------
     State Management
     ------------------------------------------------------------ */
  const [contactFormData, setContactFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------------------------------------------------
     Load Cart Data from Local Storage and Fetch Product Details
     ------------------------------------------------------------ */
  async function loadCartItems() {
    const baseCartItems = getCart(); // [{ id, quantity }]
    if (!baseCartItems.length) {
      setCartItems([]);
      return;
    }

    try {
      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: baseCartItems.map((item) => item.id) }),
      });

      const result = await response.json();
      const productMap = new Map((result?.data || []).map((product) => [product.id, product]));

      // Map local cart items with product details
      const detailedCartItems = baseCartItems.map((cartRow) => {
        const product = productMap.get(cartRow.id);
        return {
          id: cartRow.id,
          quantity: Number(cartRow.quantity || 1),
          name: product?.name || "Unnamed Product",
          price: product?.hide_price ? 0 : Number(product?.price || 0), // if hide_price = 1 → show 0
          image: product?.image_path || "",
          hide_price: !!product?.hide_price,
        };
      });

      setCartItems(detailedCartItems);
    } catch (error) {
      console.error("Failed to load cart items:", error);
      setCartItems([]);
    }
  }

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      await loadCartItems();
      if (isMounted) setIsLoading(false);
    })();

    const handleCartChange = () => loadCartItems();
    window.addEventListener("cart:change", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      isMounted = false;
      window.removeEventListener("cart:change", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  /* ------------------------------------------------------------
     Calculate Totals
     ------------------------------------------------------------ */
  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const { subtotal, total } = useMemo(() => computeTotals(cartItems), [cartItems]);

  /* ------------------------------------------------------------
     Handle Form Input Change
     ------------------------------------------------------------ */
  function handleInputChange(event) {
    const { name, value } = event.target;
    setContactFormData((previousData) => ({ ...previousData, [name]: value }));
  }

  /* ------------------------------------------------------------
     Submit Quote Request
     ------------------------------------------------------------ */
  async function handleSubmit(event) {
    event.preventDefault();

    const { fullName, phoneNumber, emailAddress } = contactFormData;
    if (!fullName || !phoneNumber || !emailAddress) return;

    setIsSubmitting(true);

    try {
      // Prepare quote items
      const quoteItems = cartItems.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity || 1),
      }));

      // Construct payload for quote creation
      const payload = {
        customer_name: contactFormData.fullName,
        customer_email: contactFormData.emailAddress,
        company_name: contactFormData.companyName || null,
        customer_phone: contactFormData.phoneNumber,
        notes: contactFormData.note || null,
        QuoteItems: quoteItems,
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse?.error || "Failed to submit quote request.");
      }

      clearCart();
      router.push("/quote/success");
    } catch (error) {
      console.error("Quote submission failed:", error);
      alert(error.message || "An error occurred while submitting your request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="h-18 w-18 mx-auto mb-4 flex items-center justify-center rounded-md bg-red-100">
          <MessageSquare className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="pb-2.5 text-3xl font-bold md:text-4xl">Request a Quote</h1>
        <p className="text-gray-600">
          Review your items and tell us about your requirements for a custom quote.
        </p>
      </div>

      {/* Two-Column Layout: Items + Contact Form */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Cart Items for Quote */}
        <section className="space-y-4 rounded-lg bg-gray-50 p-6 shadow-md">
          <h2 className="text-2xl font-bold">Items for Quote</h2>

          {isLoading ? (
            <p className="text-gray-500">Loading items...</p>
          ) : cartItems.length ? (
            <ul className="space-y-2">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-gray-700">
                  <span className="truncate">{item.name}</span>
                  <span className="whitespace-nowrap">
                    {item.quantity} × {formatTHB(item.price)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md bg-gray-100 p-4 text-center text-gray-600">
              Your quote list is empty.
            </div>
          )}

          {/* Totals Section */}
          <div className="space-y-2 border-t border-gray-300 pt-4">
            <div className="flex justify-between font-semibold">
              <span>
                Subtotal <span className="text-gray-500">({itemCount} items)</span>
              </span>
              <span>{formatTHB(subtotal)}</span>
            </div>

            <div className="flex justify-between text-xl font-bold text-black">
              <span>Estimated Total</span>
              <span className="text-[#A90000]">{formatTHB(total)}</span>
            </div>
          </div>

          <div className="rounded-md bg-blue-100 p-4 text-sm">
            <p className="italic text-blue-900">
              Note: This is an estimated total. Final pricing may vary based on your specific
              requirements and any customizations discussed.
            </p>
          </div>
        </section>

        {/* Right Column: Contact Form */}
        <section className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Contact Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={contactFormData.fullName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name (Optional)
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={contactFormData.companyName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={contactFormData.phoneNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={contactFormData.emailAddress}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                value={contactFormData.note}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Link href="/cart" className="text-blue-600 hover:underline">
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !cartItems.length}
                className="rounded-lg bg-red-600 px-6 py-3 text-white shadow transition-colors hover:bg-[#a90000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Send Quote Request"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
