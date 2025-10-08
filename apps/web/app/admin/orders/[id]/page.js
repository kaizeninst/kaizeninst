"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb"; // ✅ import breadcrumb component

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

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

  async function deleteOrder() {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE", credentials: "include" });
      router.push("/admin/orders");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  /* ---------- UI ---------- */
  return (
    <div className="p-6">
      {/* ✅ Breadcrumb */}
      <Breadcrumb items={[{ label: "Orders", href: "/admin/orders" }, { label: `Order #${id}` }]} />

      {/* Header */}
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <p className="text-gray-500">
            Order ID: <span className="font-medium text-gray-700">OD-{order.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/admin/orders/${id}/edit`)}
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Edit Order
          </button>
          <button
            onClick={deleteOrder}
            disabled={deleting}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Customer Information" className="md:col-span-2">
          <Info label="Name" value={order.customer_name} />
          <Info label="Email" value={order.customer_email} />
          <Info label="Phone" value={order.phone || "-"} />
          <Info label="Shipping Address" value={order.shipping_address || "-"} />
        </Card>

        <Card title="Order Status">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Order Status</span>
            <StatusBadge status={order.order_status} />
          </div>
          <select
            value={order.order_status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            className="mb-4 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Payment</span>
            <PaymentBadge status={order.payment_status} />
          </div>
          <select
            value={order.payment_status}
            onChange={(e) => updatePaymentStatus(e.target.value)}
            className="mb-4 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>

          <Info label="Order Date" value={new Date(order.created_at).toLocaleDateString()} />
          <Info label="Shipping Method" value={order.shipping_method || "-"} />
        </Card>
      </div>

      {/* Items */}
      <Card title="Order Items" className="mt-6">
        <div className="divide-y">
          {order.OrderItems?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between py-3 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium">{item.Product?.name}</p>
                <p className="text-xs text-gray-500">
                  Qty {item.quantity} × THB {Number(item.unit_price || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right font-semibold text-red-600">
                THB {Number(item.line_total || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right text-lg font-bold text-red-600">
          Total: THB {Number(order.total || 0).toFixed(2)}
        </div>
      </Card>

      {/* Tracking & Notes */}
      <Card title="Tracking & Notes" className="mt-6">
        <Info label="Tracking Number" value={order.tracking_number || "-"} />
        <Info label="Order Notes" value={order.notes || "-"} />
      </Card>
    </div>
  );
}

/* ---------- Subcomponents ---------- */
function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p className="mb-1 text-sm">
      <span className="font-medium text-gray-700">{label}:</span>{" "}
      <span className="text-gray-600">{value}</span>
    </p>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-gray-100 text-gray-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] || ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentBadge({ status }) {
  const colors = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] || ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
