"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function QuoteDetailPage() {
  const params = useParams();
  const { id } = params;

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchQuote() {
    try {
      const res = await fetch(`/api/quotes/${id}`, { credentials: "include" });
      const data = await res.json();
      setQuote(data);
    } catch (err) {
      console.error("Failed to load quote:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchQuote();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!quote) return <p className="p-6 text-red-500">Quote not found</p>;

  const totalValue = quote.QuoteItems?.reduce(
    (sum, item) => sum + parseFloat(item.line_total || 0),
    0
  ).toFixed(2);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Quotes", href: "/admin/quotes" },
              { label: `View Quote #${id}` },
            ]}
          />
          <h1 className="text-2xl font-bold">Quote Detail</h1>
          <p className="text-sm text-gray-500">Quote ID: QT-{quote.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">
            Send Quote
          </button>

          {/* 🆕 ปรับ Edit ให้ไปหน้า /edit */}
          <Link
            href={`/admin/quotes/${quote.id}/edit`}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Edit Quote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Customer Info */}
        <div className="rounded border bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Customer Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Name</p>
              <p>{quote.customer_name}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>{quote.customer_email}</p>
            </div>
            <div>
              <p className="font-medium">Company</p>
              <p>{quote.company_name || "-"}</p>
            </div>
            <div>
              <p className="font-medium">Quote Date</p>
              <p>{new Date(quote.requested_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium">Notes</p>
            <p className="text-sm text-gray-700">{quote.notes || "-"}</p>
          </div>
        </div>

        {/* Quote Status */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Quote Status</h2>
          <p className="mb-2 text-sm">
            Current Status: <span className="font-medium capitalize">{quote.status}</span>
          </p>
          <p className="text-sm">
            Valid Until:{" "}
            {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "-"}
          </p>
        </div>
      </div>

      {/* Quote Items */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Quote Items</h2>
        <div className="space-y-3">
          {quote.QuoteItems?.map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <p className="font-medium">{item.Product?.name}</p>
                <p className="text-xs text-gray-500">
                  Quantity: {item.quantity} | Unit Price: ${item.unit_price}
                </p>
              </div>
              <div className="font-bold text-red-600">
                ${parseFloat(item.line_total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t pt-3 font-semibold">
          <span>Total Quote Value:</span>
          <span className="text-red-600">${totalValue}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border bg-white p-4 shadow-sm md:col-start-3">
          <h2 className="mb-3 text-sm font-semibold">Actions</h2>
          <div className="space-y-2">
            <button className="w-full rounded border px-3 py-2 text-sm hover:bg-gray-100">
              Download PDF
            </button>
            <button className="w-full rounded border px-3 py-2 text-sm hover:bg-gray-100">
              Send Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
