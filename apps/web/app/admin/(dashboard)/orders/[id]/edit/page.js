"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveOrder(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(order),
      });
      router.push(`/admin/orders/${id}`);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href={`/admin/orders/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Back to Order
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Edit Order</h1>
          <p className="text-gray-500">Order ID: OD-{order.id}</p>
        </div>
      </div>

      <form onSubmit={saveOrder} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Customer Info */}
          <div className="rounded border bg-white p-4 shadow-sm md:col-span-2">
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
              value={order.phone || ""}
              onChange={(e) => setOrder({ ...order, phone: e.target.value })}
              className="mb-3 w-full rounded border px-2 py-1 text-sm"
            />
            <label className="block text-sm">Shipping Address</label>
            <textarea
              value={order.shipping_address || ""}
              onChange={(e) => setOrder({ ...order, shipping_address: e.target.value })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>

          {/* Status */}
          <div className="rounded border bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Order Status</h2>
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
              className="mb-3 w-full rounded border px-2 py-1 text-sm"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>

            <p>
              <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
            </p>
            <label className="mt-2 block text-sm">Shipping Method</label>
            <input
              type="text"
              value={order.shipping_method || ""}
              onChange={(e) => setOrder({ ...order, shipping_method: e.target.value })}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Items */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Order Items</h2>
          <div className="divide-y">
            {order.OrderItems?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.Product?.name}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × Unit Price: {item.unit_price}
                  </p>
                </div>
                <div className="font-semibold text-red-600">
                  THB {Number(item.line_total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right font-bold text-red-600">
            Total: THB {Number(order.total).toFixed(2)}
          </div>
        </div>

        {/* Tracking & Notes */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Tracking & Notes</h2>
          <label className="block text-sm">Tracking Number</label>
          <input
            type="text"
            value={order.tracking_number || ""}
            onChange={(e) => setOrder({ ...order, tracking_number: e.target.value })}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          />
          <label className="block text-sm">Notes</label>
          <textarea
            value={order.notes || ""}
            onChange={(e) => setOrder({ ...order, notes: e.target.value })}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/orders/${id}`)}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
