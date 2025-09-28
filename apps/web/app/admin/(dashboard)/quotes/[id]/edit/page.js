"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";

export default function EditQuotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  async function fetchQuote() {
    try {
      const res = await fetch(`/api/quotes/${id}`, { credentials: "include" });
      const data = await res.json();
      setQuote({
        ...data,
        QuoteItems: data.QuoteItems.map((item) => ({
          ...item,
          product_id: Number(item.product_id),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });
    } catch (err) {
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
    const newIndex = quote.QuoteItems.length;
    const updatedItems = [
      ...quote.QuoteItems,
      { product_id: "", quantity: 1, unit_price: 0, line_total: 0 },
    ];
    setQuote({ ...quote, QuoteItems: updatedItems });
    setEditIndex(newIndex);
  }

  function removeItem(index) {
    const updated = [...quote.QuoteItems];
    updated.splice(index, 1);
    setQuote({ ...quote, QuoteItems: updated });
  }

  async function onSave() {
    try {
      const payload = {
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        company_name: quote.company_name,
        valid_until: quote.valid_until,
        status: quote.status,
        QuoteItems: quote.QuoteItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
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
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <p className="text-sm text-gray-500">Quote ID: QT-{quote.id}</p>
        </div>
        <button
          onClick={onSave}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* Quote Items */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Quote Items</h2>
        <div className="space-y-3">
          {quote.QuoteItems?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between"
            >
              {/* Product */}
              <div className="flex-1">
                {editIndex === idx ? (
                  <ProductSelect
                    value={item.product_id}
                    onChange={(val) => handleItemChange(idx, "product_id", val)}
                    products={products}
                  />
                ) : (
                  <p className="font-medium">
                    {products.find((p) => p.id === Number(item.product_id))?.name ||
                      "Unknown Product"}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="w-20 text-right">
                {editIndex === idx ? (
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    className="w-full rounded border px-2 py-1 text-right text-sm"
                  />
                ) : (
                  <span className="text-sm">{item.quantity}</span>
                )}
              </div>

              {/* Unit Price */}
              <div className="w-28 text-right text-sm text-gray-700">
                ${parseFloat(item.unit_price || 0).toFixed(2)}
              </div>

              {/* Line Total */}
              <div className="w-28 text-right font-bold text-red-600">
                ${parseFloat(item.line_total || 0).toFixed(2)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditIndex(editIndex === idx ? null : idx)}
                  className={`rounded px-3 py-1 text-xs text-white ${
                    editIndex === idx
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {editIndex === idx ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => removeItem(idx)}
                  className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
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
    </div>
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
