"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function updateOrderStatus(newStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ order_status: newStatus }),
    });
    fetchOrder();
  }

  async function updatePaymentStatus(newStatus) {
    await fetch(`/api/orders/${id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ payment_status: newStatus }),
    });
    fetchOrder();
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
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Order Details</h1>
          <p className="text-gray-500">Order ID: OD-{order.id}</p>
        </div>
        <button
          onClick={() => router.push(`/admin/orders/${id}/edit`)}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Edit Order
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info */}
        <div className="rounded border bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 font-semibold">Customer Information</h2>
          <p>
            <strong>Name:</strong> {order.customer_name}
          </p>
          <p>
            <strong>Email:</strong> {order.customer_email}
          </p>
          <p>
            <strong>Phone:</strong> {order.phone || "-"}
          </p>
          <p>
            <strong>Shipping Address:</strong> {order.shipping_address || "-"}
          </p>
        </div>

        {/* Status */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Order Status</h2>
          <p className="mb-2">
            <strong>Current Status:</strong>
          </p>
          <select
            value={order.order_status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <p className="mb-2">
            <strong>Payment Status:</strong>
          </p>
          <select
            value={order.payment_status}
            onChange={(e) => updatePaymentStatus(e.target.value)}
            className="mb-3 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>

          <p>
            <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Shipping Method:</strong> {order.shipping_method || "-"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Order Items</h2>
        <div className="divide-y">
          {order.OrderItems?.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{item.Product?.name}</p>
                <p className="text-xs text-gray-500">
                  Quantity: {item.quantity} × Unit Price: {item.unit_price}
                </p>
              </div>
              <div className="font-semibold text-red-600">
                THB {Number(item.line_total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right font-bold text-red-600">
          Total Order Value: THB {Number(order.total).toFixed(2)}
        </div>
      </div>

      {/* Tracking & Notes */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Tracking & Notes</h2>
        <p>
          <strong>Tracking Number:</strong> {order.tracking_number || "-"}
        </p>
        <p>
          <strong>Order Notes:</strong> {order.notes || "-"}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Actions</h2>
        <div className="flex flex-col gap-2">
          <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
            Email Customer
          </button>
          <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
            Print Invoice
          </button>
          <button className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50">
            Process Refund
          </button>
        </div>
      </div>
    </div>
  );
}
