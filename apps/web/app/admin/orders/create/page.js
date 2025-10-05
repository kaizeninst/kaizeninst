"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function OrderCreatePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({
    customer_name: "",
    customer_email: "",
    phone: "",
    shipping_address: "",
    shipping_method: "",
    payment_status: "unpaid",
    order_status: "pending",
    notes: "",
    OrderItems: [],
  });
  const [saving, setSaving] = useState(false);

  // โหลด products จาก API
  async function fetchProducts() {
    const res = await fetch("/api/products", { credentials: "include" });
    const data = await res.json();
    setProducts((data.data || []).map((p) => ({ ...p, id: Number(p.id) })));
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // เพิ่ม OrderItem ใหม่
  function addItem() {
    setOrder((prev) => ({
      ...prev,
      OrderItems: [
        ...prev.OrderItems,
        { product_id: "", quantity: 1, unit_price: 0, line_total: 0 },
      ],
    }));
  }

  // ลบ OrderItem
  function removeItem(index) {
    setOrder((prev) => {
      const items = prev.OrderItems.filter((_, i) => i !== index);
      return { ...prev, OrderItems: items };
    });
  }

  // แก้ไข OrderItem
  function handleItemChange(index, field, value) {
    const updatedItems = [...order.OrderItems];

    if (field === "product_id") {
      updatedItems[index].product_id = Number(value);
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        // ถ้า hide_price = true → ราคาเป็น 0
        const unitPrice = product.hide_price ? 0 : parseFloat(product.price);
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

    setOrder({ ...order, OrderItems: updatedItems });
  }

  // บันทึก order
  async function saveOrder(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        phone: order.phone,
        shipping_address: order.shipping_address,
        shipping_method: order.shipping_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        notes: order.notes,
        OrderItems: order.OrderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
        })),
      };

      await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      router.push("/admin/orders");
    } catch (err) {
      console.error("Create order failed:", err);
    } finally {
      setSaving(false);
    }
  }

  const total = order.OrderItems.reduce((sum, item) => sum + (parseFloat(item.line_total) || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Create Order</h1>
        </div>
      </div>

      <form onSubmit={saveOrder} className="space-y-6">
        {/* Customer Info */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Customer Information</h2>
          <label className="block text-sm">Name</label>
          <input
            type="text"
            value={order.customer_name}
            onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          />
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={order.customer_email}
            onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          />
          <label className="block text-sm">Phone</label>
          <input
            type="text"
            value={order.phone}
            onChange={(e) => setOrder({ ...order, phone: e.target.value })}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          />
          <label className="block text-sm">Shipping Address</label>
          <textarea
            value={order.shipping_address}
            onChange={(e) => setOrder({ ...order, shipping_address: e.target.value })}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>

        {/* Shipping & Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded border bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Shipping Method</h2>
            <input
              type="text"
              value={order.shipping_method}
              onChange={(e) => setOrder({ ...order, shipping_method: e.target.value })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div className="rounded border bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Statuses</h2>
            <label className="block text-sm">Order Status</label>
            <select
              value={order.order_status}
              onChange={(e) => setOrder({ ...order, order_status: e.target.value })}
              className="mb-3 w-full rounded border px-2 py-1 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <label className="block text-sm">Payment Status</label>
            <select
              value={order.payment_status}
              onChange={(e) => setOrder({ ...order, payment_status: e.target.value })}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Order Items</h2>
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
            className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
          >
            + Add Item
          </button>

          <div className="mt-3 text-right font-bold text-red-600">
            Total: THB {total.toFixed(2)}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Notes</h2>
          <textarea
            value={order.notes}
            onChange={(e) => setOrder({ ...order, notes: e.target.value })}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* 🛒 Component สำหรับเลือกสินค้า + ค้นหา */
function OrderItemRow({ idx, item, products, handleItemChange, removeItem }) {
  const [query, setQuery] = useState("");

  const filteredProducts =
    query === ""
      ? products
      : products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mb-3 flex items-center gap-3">
      <Combobox
        value={item.product_id}
        onChange={(val) => handleItemChange(idx, "product_id", val)}
      >
        <div className="relative flex-1">
          <ComboboxInput
            className="w-full rounded border px-2 py-1 text-sm"
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(id) => products.find((p) => p.id === id)?.name || ""}
            placeholder="Search product..."
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </ComboboxButton>
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg">
            {filteredProducts.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
            )}
            {filteredProducts.map((p) => (
              <ComboboxOption
                key={p.id}
                value={p.id}
                className={({ active, selected }) =>
                  `relative cursor-pointer px-3 py-2 text-sm ${
                    active ? "bg-red-600 text-white" : "text-gray-900"
                  } ${selected ? "font-medium" : ""}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className="block truncate">
                      {p.name}
                      {!p.hide_price && <span className="text-gray-500"> (THB {p.price})</span>}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* Quantity */}
      <input
        type="number"
        value={item.quantity}
        min="1"
        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
        className="w-24 rounded border px-2 py-1 text-sm"
      />

      {/* Line total */}
      <span className="text-sm">THB {item.line_total ? item.line_total.toFixed(2) : "0.00"}</span>

      {/* Remove */}
      <button
        type="button"
        onClick={() => removeItem(idx)}
        className="text-xs text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
