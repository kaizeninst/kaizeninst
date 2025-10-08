"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function EditQuotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchQuote() {
    try {
      const res = await fetch(`/api/quotes/${id}`, { credentials: "include" });
      const data = await res.json();
      setQuote(data);
    } catch {
      setError("Failed to load quote");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products`, { credentials: "include" });
      const data = await res.json();
      setProducts((data.data || []).map((p) => ({ ...p, id: Number(p.id) })));
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  }

  useEffect(() => {
    if (id) {
      fetchQuote();
      fetchProducts();
    }
  }, [id]);

  function handleItemChange(index, field, value) {
    const updated = [...quote.QuoteItems];
    if (field === "product_id") {
      updated[index].product_id = Number(value);
      const p = products.find((pr) => pr.id === Number(value));
      if (p) {
        const price = p.hide_price ? 0 : parseFloat(p.price);
        updated[index].unit_price = price;
        updated[index].line_total = (updated[index].quantity || 1) * price;
      }
    }
    if (field === "quantity") {
      updated[index].quantity = Number(value);
      const qty = updated[index].quantity || 0;
      const price = parseFloat(updated[index].unit_price) || 0;
      updated[index].line_total = qty * price;
    }
    setQuote({ ...quote, QuoteItems: updated });
  }

  function addItem() {
    setQuote({
      ...quote,
      QuoteItems: [
        ...quote.QuoteItems,
        { product_id: "", quantity: 1, unit_price: 0, line_total: 0 },
      ],
    });
  }

  function removeItem(index) {
    const updated = [...quote.QuoteItems];
    updated.splice(index, 1);
    setQuote({ ...quote, QuoteItems: updated });
  }

  async function onSave(e) {
    e.preventDefault();
    try {
      const payload = {
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        company_name: quote.company_name,
        valid_until: quote.valid_until,
        notes: quote.notes,
        status: quote.status,
        QuoteItems: quote.QuoteItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      router.push(`/admin/quotes/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!quote) return <p className="p-6 text-red-500">Quote not found</p>;

  const totalValue = quote.QuoteItems?.reduce(
    (sum, item) => sum + parseFloat(item.line_total || 0),
    0
  ).toFixed(2);

  return (
    <form onSubmit={onSave} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Quotes", href: "/admin/quotes" },
              { label: `Edit Quote #${id}` },
            ]}
          />
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <p className="text-sm text-gray-500">Update customer & product details</p>
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* Customer Info */}
      <div className="rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Customer Information</h2>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Customer Name</label>
            <input
              type="text"
              value={quote.customer_name}
              onChange={(e) => setQuote({ ...quote, customer_name: e.target.value })}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Customer Email</label>
            <input
              type="email"
              value={quote.customer_email}
              onChange={(e) => setQuote({ ...quote, customer_email: e.target.value })}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
            <input
              type="text"
              value={quote.company_name || ""}
              onChange={(e) => setQuote({ ...quote, company_name: e.target.value })}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Valid Until</label>
            <input
              type="date"
              value={quote.valid_until || ""}
              onChange={(e) => setQuote({ ...quote, valid_until: e.target.value })}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
          <textarea
            value={quote.notes || ""}
            onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            placeholder="Additional notes for this quote..."
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      </div>

      {/* Quote Items */}
      <div className="rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Quote Items</h2>
        <div className="space-y-3">
          {quote.QuoteItems?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600">Product</label>
                <ProductSelect
                  value={item.product_id}
                  onChange={(val) => handleItemChange(idx, "product_id", val)}
                  products={products}
                />
              </div>

              <div className="w-24 text-right">
                <label className="mb-1 block text-left text-xs font-medium text-gray-600">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  className="w-full rounded border px-2 py-1 text-right text-sm"
                />
              </div>

              <div className="w-28 text-right text-sm text-gray-700">
                <label className="mb-1 block text-left text-xs font-medium text-gray-600">
                  Unit Price
                </label>
                ${parseFloat(item.unit_price || 0).toFixed(2)}
              </div>

              <div className="w-28 text-right font-bold text-red-600">
                <label className="mb-1 block text-left text-xs font-medium text-gray-600">
                  Line Total
                </label>
                ${parseFloat(item.line_total || 0).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="mt-5 rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={addItem}
            className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          >
            + Add Product
          </button>
        </div>

        <div className="mt-4 flex justify-between border-t pt-3 font-semibold">
          <span>Total Quote Value:</span>
          <span className="text-red-600">${totalValue}</span>
        </div>
      </div>
    </form>
  );
}

/* ✅ ProductSelect component (same as Create) */
function ProductSelect({ value, onChange, products }) {
  const [query, setQuery] = useState("");
  const filtered =
    query === ""
      ? products
      : products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={value} onChange={(val) => onChange(Number(val))}>
      <div className="relative">
        <ComboboxInput
          className="w-full rounded border px-2 py-1 text-sm"
          displayValue={(id) => products.find((p) => p.id === Number(id))?.name || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product..."
        />
        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
          ) : (
            filtered.map((p) => (
              <ComboboxOption
                key={p.id}
                value={p.id}
                className={({ active }) =>
                  `cursor-pointer px-3 py-2 text-sm ${active ? "bg-blue-500 text-white" : ""}`
                }
              >
                {p.name} - ${p.hide_price ? "0.00" : p.price}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
