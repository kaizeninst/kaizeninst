"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Plus } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

/* ---------------------- Main Component ---------------------- */
export default function OrderEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------------------- Load Data ---------------------- */
  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchProducts();
    }
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
      const data = await res.json();
      setOrder({
        ...data,
        total: data.OrderItems?.reduce((sum, i) => sum + (parseFloat(i.line_total) || 0), 0) || 0,
      });
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      const data = await res.json();
      setProducts((data.data || []).map((p) => ({ ...p, id: Number(p.id) })));
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  }

  /* ---------------------- Handlers ---------------------- */
  function handleItemChange(index, field, value) {
    const updatedItems = [...order.OrderItems];

    if (field === "product_id") {
      updatedItems[index].product_id = Number(value);
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        const price = product.hide_price ? 0 : parseFloat(product.price || 0);
        updatedItems[index].unit_price = price;
      }
    }

    if (field === "quantity") {
      updatedItems[index].quantity = Number(value);
    }

    // คำนวณ line_total ใหม่ทุกครั้ง
    updatedItems[index].line_total =
      (updatedItems[index].quantity || 0) * (parseFloat(updatedItems[index].unit_price) || 0);

    // รวมยอดใหม่ทั้งหมด
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + (parseFloat(item.line_total) || 0),
      0
    );

    setOrder({ ...order, OrderItems: updatedItems, total: newTotal });
  }

  function addItem() {
    setOrder((prev) => ({
      ...prev,
      OrderItems: [
        ...prev.OrderItems,
        { product_id: "", quantity: 1, unit_price: 0, line_total: 0 },
      ],
    }));
  }

  function removeItem(index) {
    const updated = order.OrderItems.filter((_, i) => i !== index);
    const newTotal = updated.reduce((sum, i) => sum + (parseFloat(i.line_total) || 0), 0);
    setOrder({ ...order, OrderItems: updated, total: newTotal });
  }

  async function saveOrder(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // ✅ Validation
      if (!order.customer_name.trim()) return alert("Please enter customer name");
      if (!order.customer_email.trim() || !order.customer_email.includes("@"))
        return alert("Please enter a valid email");
      if (order.OrderItems.length === 0) return alert("Please add at least one order item");

      for (const item of order.OrderItems) {
        if (!item.product_id) return alert("Please select product for all items");
        if (item.quantity <= 0) return alert("Quantity must be greater than 0");
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Failed to save order");

      alert("✅ Order updated successfully!");
      router.push(`/admin/orders/${id}`);
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------- UI ---------------------- */
  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Orders", href: "/admin/orders" }, { label: `Edit Order #${id}` }]}
      />

      <h1 className="mb-6 text-2xl font-semibold">Edit Order</h1>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <form onSubmit={saveOrder} className="space-y-6 p-6">
          {/* Customer Info */}
          <Section title="Customer Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Customer Name"
                required
                value={order.customer_name}
                onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
              />
              <Input
                label="Email"
                required
                value={order.customer_email}
                onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
              />
              <Input
                label="Phone"
                value={order.phone || ""}
                onChange={(e) => setOrder({ ...order, phone: e.target.value })}
              />
              <Input
                label="Shipping Method"
                value={order.shipping_method || ""}
                onChange={(e) => setOrder({ ...order, shipping_method: e.target.value })}
              />
            </div>
            <label className="mt-3 block text-sm font-medium text-gray-700">
              Shipping Address <span className="text-red-600">*</span>
            </label>
            <textarea
              value={order.shipping_address || ""}
              onChange={(e) => setOrder({ ...order, shipping_address: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
            />
          </Section>

          {/* Status */}
          <Section title="Statuses">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Order Status <span className="text-red-600">*</span>
                </label>
                <select
                  value={order.order_status}
                  onChange={(e) => setOrder({ ...order, order_status: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Payment Status <span className="text-red-600">*</span>
                </label>
                <select
                  value={order.payment_status}
                  onChange={(e) => setOrder({ ...order, payment_status: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Items */}
          <Section title="Order Items">
            {order.OrderItems.map((item, idx) => (
              <OrderItemRow
                key={idx}
                idx={idx}
                item={item}
                products={products}
                handleItemChange={handleItemChange}
                removeItem={removeItem}
              />
            ))}

            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>

            <div className="mt-3 text-right text-lg font-semibold text-red-600">
              Total: THB {(order.total || 0).toFixed(2)}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Tracking & Notes">
            <Input
              label="Tracking Number"
              value={order.tracking_number || ""}
              onChange={(e) => setOrder({ ...order, tracking_number: e.target.value })}
            />
            <label className="mt-3 block text-sm font-medium">Notes</label>
            <textarea
              value={order.notes || ""}
              onChange={(e) => setOrder({ ...order, notes: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
            />
          </Section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/orders/${id}`)}
              className="rounded border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------- Sub Components ---------------------- */
function Section({ title, children }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, required = false, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input {...props} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
    </div>
  );
}

/* 🛒 Combobox สำหรับเลือกสินค้า */
function OrderItemRow({ idx, item, products, handleItemChange, removeItem }) {
  const [query, setQuery] = useState("");

  // ✅ filter เฉพาะตอนพิมพ์ค้นหา
  const filtered =
    query === ""
      ? products
      : products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mb-2 flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Product Select */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600">
          Product <span className="text-red-600">*</span>
        </label>
        <Combobox
          value={item.product_id}
          onChange={(val) => handleItemChange(idx, "product_id", val)}
        >
          <div className="relative">
            <ComboboxInput
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              placeholder="Search product..."
              onChange={(e) => setQuery(e.target.value)}
              displayValue={(id) => {
                // ✅ พยายามหาชื่อจาก products ก่อน
                const found = products.find((p) => p.id === id);
                if (found) return found.name;

                // ✅ ถ้าไม่เจอ → ใช้ชื่อจาก item.Product (ข้อมูลใน order)
                return item?.Product?.name || "";
              }}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </ComboboxButton>

            {/* Dropdown */}
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow">
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
              )}
              {filtered.map((p) => (
                <ComboboxOption
                  key={p.id}
                  value={p.id}
                  className={({ active, selected }) =>
                    `cursor-pointer px-3 py-2 text-sm ${
                      active ? "bg-red-600 text-white" : "text-gray-900"
                    } ${selected ? "font-medium" : ""}`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>
                        {p.name}{" "}
                        {!p.hide_price && <span className="text-gray-400">(THB {p.price})</span>}
                      </span>
                      {selected && <CheckIcon className="h-4 w-4 text-white" />}
                    </div>
                  )}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </div>
        </Combobox>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-xs font-medium text-gray-600">
          Quantity <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
          className="mt-1 w-24 rounded border px-2 py-1 text-sm"
        />
      </div>

      {/* Line total */}
      <div className="flex items-end gap-2">
        <span className="text-sm font-medium">THB {Number(item.line_total || 0).toFixed(2)}</span>
        <button
          type="button"
          onClick={() => removeItem(idx)}
          className="text-xs text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
