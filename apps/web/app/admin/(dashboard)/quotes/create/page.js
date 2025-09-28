"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";

export default function CreateQuotePage() {
  const router = useRouter();

  const [quote, setQuote] = useState({
    customer_name: "",
    customer_email: "",
    company_name: "",
    valid_until: "",
    status: "draft",
    notes: "",
    QuoteItems: [],
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

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
    fetchProducts();
  }, []);

  function handleItemChange(index, field, value) {
    const updatedItems = [...quote.QuoteItems];

    if (field === "product_id") {
      updatedItems[index].product_id = Number(value);
      const p = products.find((pr) => pr.id === Number(value));
      if (p) {
        const unitPrice = p.hide_price ? 0 : parseFloat(p.price);
        updatedItems[index].unit_price = unitPrice;
        updatedItems[index].line_total = (updatedItems[index].quantity || 1) * unitPrice;
      }
    }

    if (field === "quantity") {
      updatedItems[index].quantity = Number(value);
      const qty = updatedItems[index].quantity || 0;
      const price = parseFloat(updatedItems[index].unit_price) || 0;
      updatedItems[index].line_total = qty * price;
    }

    setQuote({ ...quote, QuoteItems: updatedItems });
  }

  function addItem() {
    const updatedItems = [
      ...quote.QuoteItems,
      { product_id: "", quantity: 1, unit_price: 0, line_total: 0 },
    ];
    setQuote({ ...quote, QuoteItems: updatedItems });
  }

  function removeItem(index) {
    const updated = [...quote.QuoteItems];
    updated.splice(index, 1);
    setQuote({ ...quote, QuoteItems: updated });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        company_name: quote.company_name,
        valid_until: quote.valid_until,
        status: quote.status,
        notes: quote.notes,
        QuoteItems: quote.QuoteItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      router.push(`/admin/quotes/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalValue = quote.QuoteItems?.reduce(
    (sum, item) => sum + parseFloat(item.line_total || 0),
    0
  ).toFixed(2);

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Quote</h1>
          <p className="text-sm text-gray-500">Fill customer & product details</p>
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Quote
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
              placeholder="Enter customer name"
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
              placeholder="Enter customer email"
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
            <input
              type="text"
              value={quote.company_name}
              onChange={(e) => setQuote({ ...quote, company_name: e.target.value })}
              placeholder="Enter company"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Valid Until</label>
            <input
              type="date"
              value={quote.valid_until}
              onChange={(e) => setQuote({ ...quote, valid_until: e.target.value })}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
          <textarea
            value={quote.notes}
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
              {/* Product */}
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600">Product</label>
                <ProductSelect
                  value={item.product_id}
                  onChange={(val) => handleItemChange(idx, "product_id", val)}
                  products={products}
                />
              </div>

              {/* Quantity */}
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

              {/* Unit Price */}
              <div className="w-28 text-right text-sm text-gray-700">
                <label className="mb-1 block text-left text-xs font-medium text-gray-600">
                  Unit Price
                </label>
                ${parseFloat(item.unit_price || 0).toFixed(2)}
              </div>

              {/* Line Total */}
              <div className="w-28 text-right font-bold text-red-600">
                <label className="mb-1 block text-left text-xs font-medium text-gray-600">
                  Line Total
                </label>
                ${parseFloat(item.line_total || 0).toFixed(2)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="mt-5 rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product */}
        <div className="mt-4">
          <button
            type="button"
            onClick={addItem}
            className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          >
            + Add Product
          </button>
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-between border-t pt-3 font-semibold">
          <span>Total Quote Value:</span>
          <span className="text-red-600">${totalValue}</span>
        </div>
      </div>
    </form>
  );
}

/* ✅ ProductSelect with hide_price logic */
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
          displayValue={(productId) => products.find((p) => p.id === Number(productId))?.name || ""}
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
